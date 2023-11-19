import debug from "debug";

// eslint-disable-next-line @typescript-eslint/ban-types
export function buildDebugger(module: string | undefined): any {
  const name = "code-complexity";
  return name ? debug(`${name}:${module}`) : debug(name);
}

export class UnsupportedExtension {}
