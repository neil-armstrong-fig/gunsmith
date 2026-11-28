#!/usr/bin/env node
// Lists every catalog dependency that is behind, with the newest version the supply-chain policy lets in: the newest plain
// x.y.z release at least `minimumReleaseAge` minutes old (read from pnpm-workspace.yaml), whether that release is deprecated,
// and the newest stable release, which may still be inside the window. Read-only: it runs `pnpm outdated` and `pnpm view`.
// Usage, from the repository root: node .agents/skills/bump-dependencies/EligibleVersions.mjs
import {execFile, execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {promisify} from "node:util";

const run = promisify(execFile);
const PLAIN_VERSION = /^\d+\.\d+\.\d+$/;

await main();

async function main() {
  const ageMinutes = minimumReleaseAge();
  const cutOff = new Date(Date.now() - ageMinutes * 60_000);
  const outdated = outdatedPackages();
  const rows = await Promise.all(Object.entries(outdated).map(([name, entry]) => rowFor(name, entry, cutOff)));

  console.log(
    `Release-age policy: ${ageMinutes / 1440} days, so eligible means published on or before ${cutOff.toISOString().slice(0, 10)}.\n`,
  );
  console.log("| Package | Now | Eligible | Deprecated, passed over | Newest stable | Used by |");
  console.log("| --- | --- | --- | --- | --- | --- |");
  for (const row of rows.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(
      `| ${row.name} | ${row.current} | ${row.eligible} | ${row.deprecated} | ${row.newest} | ${row.usedBy} |`,
    );
  }
}

function minimumReleaseAge() {
  const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
  const match = /^minimumReleaseAge:\s*(\d+)/m.exec(workspace);
  if (!match) {
    throw new Error("pnpm-workspace.yaml has no minimumReleaseAge");
  }

  return Number(match[1]);
}

function outdatedPackages() {
  try {
    return JSON.parse(execFileSync("pnpm", ["outdated", "-r", "--format", "json"], {encoding: "utf8"}));
  } catch (error) {
    // `pnpm outdated` exits 1 when anything is behind, which is the case this script is for.
    return JSON.parse(error.stdout);
  }
}

async function rowFor(name, entry, cutOff) {
  const {stdout} = await run("pnpm", ["view", name, "time", "--json"]);
  const published = JSON.parse(stdout);
  const newer = Object.keys(published).filter(version => {
    return PLAIN_VERSION.test(version) && compare(version, entry.current) > 0;
  });
  const oldEnough = newer.filter(version => new Date(published[version]) <= cutOff).sort(compare);
  const {eligible, skipped} = await newestNotDeprecated(name, oldEnough);
  const newest = newer.sort(compare).at(-1);
  const usedBy = (entry.dependentPackages ?? []).map(dependent => dependent.name.replace("@gunsmith/", "")).join(", ");

  return {
    name,
    current: entry.current,
    eligible: describe(eligible, published),
    deprecated: skipped.join("; "),
    newest: describe(newest, published),
    usedBy,
  };
}

// A deprecated release is never eligible (`@langchain/langgraph-cli@2.0.0` was published by mistake and is "not intended for use"),
// so walk down from the newest until one is not, and say which were passed over.
async function newestNotDeprecated(name, oldEnough) {
  const skipped = [];
  for (const version of [...oldEnough].reverse()) {
    const {stdout} = await run("pnpm", ["view", `${name}@${version}`, "deprecated"]);
    if (stdout.trim() === "") {
      return {eligible: version, skipped};
    }

    skipped.push(`${version} skipped: ${stdout.trim()}`);
  }

  return {eligible: undefined, skipped};
}

function describe(version, published) {
  if (!version) {
    return "none yet";
  }

  return `${version} (${published[version].slice(0, 10)})`;
}

function compare(a, b) {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}
