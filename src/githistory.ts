import * as micromatch from "micromatch";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Options } from "./types";

export function buildGitHistory(options: Options) {
  const isWindows = process.platform === "win32";

  const gitLogCommand = [
    "git",
    `-C ${options.directory}`,
    `log`,
    `--follow`,

    // Windows CMD handle quotes differently than linux, this is why we should put empty string as said in:
    // https://github.com/git-for-windows/git/issues/3131
    `--format=${isWindows ? "" : "''"}`,
    `--name-only`,
    options.since ? `--since="${options.since}"` : "",
    options.until ? `--until="${options.until}"` : "",

    // Windows CMD handle quotes differently
    isWindows ? "*" : "'*'",
  ];

  const stdout = execSync(gitLogCommand.filter((s) => s.length > 0).join(" "), {
    encoding: "utf8",
    maxBuffer: 32_000_000,
  }).split("\n");
  const result = stdout.filter((file) => {
    if (!file.trim().length) {
      return false;
    }
    if (!existsSync(resolve(options.directory, file))) {
      return false;
    }
    if (options.filter?.length) {
      return options.filter.every((f) => micromatch.isMatch(file, f));
    }
    return true;
  });

  const history = result.sort();
  const files = [...new Set(history)];

  const churnByPath = new Map<string, number>();
  history.forEach((path) => {
    churnByPath.set(path, (churnByPath.get(path) ?? 0) + 1);
  });

  return { files, churnByPath };
}
