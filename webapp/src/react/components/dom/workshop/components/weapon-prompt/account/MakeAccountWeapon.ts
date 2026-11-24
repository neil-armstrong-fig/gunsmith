import {generationFailureMessage} from "@src/account/generation/GenerationFailureMessage";
import {accountUrl} from "@src/account/AccountUrl";
import {parseAccountWeapon} from "@src/account/weapon/ParseAccountWeapon";
import type {WeaponToIterate} from "@src/store/workshop/types/WeaponToIterate";
import {z} from "zod";

const weaponAnswer = z.discriminatedUnion("status", [
  z.object({status: z.literal("created"), id: z.string().min(1), weapon: z.unknown(), appearance: z.unknown()}),
  z.object({status: z.enum(["rejected", "invalid"]), reason: z.string().optional()}),
]);

export async function makeAccountWeapon(prompt: string): Promise<WeaponToIterate> {
  const response = await fetch(accountUrl("/api/weapons"), {
    method: "POST",
    credentials: "include",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({prompt}),
  });
  if (!response.ok) throw new Error(await generationFailureMessage(response, "weapon"));

  const parsed = weaponAnswer.safeParse(await response.json().catch(() => undefined));
  if (!parsed.success) throw new Error("The weapon response was incomplete.");

  const answer = parsed.data;
  if (answer.status !== "created") throw new Error(answer.reason ?? "Could not make a weapon from that prompt.");

  const weapon = parseAccountWeapon(answer.weapon, answer.appearance);
  if (!weapon) throw new Error("The weapon could not be played.");

  return {id: answer.id, prompt, weapon};
}
