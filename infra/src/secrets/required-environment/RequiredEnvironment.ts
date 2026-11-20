export function requiredEnvironment<Name extends string>(
  environment: NodeJS.ProcessEnv,
  names: readonly Name[],
): Record<Name, string> {
  const missing = names.filter(name => !environment[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing deploy environment: ${missing.join(", ")}`);
  }

  return Object.fromEntries(names.map(name => [name, environment[name]])) as Record<Name, string>;
}
