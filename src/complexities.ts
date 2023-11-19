import { transformSync } from "@babel/core";
import { sloc } from "node-sloc";
import { createReadStream, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { Options, Path } from "./types";
import { buildDebugger } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const escomplex = require("escomplex");

const internal = { debug: buildDebugger("halstead") };

export async function buildComplexity(paths: Path[], options: Options) {
  const map = new Map();
  await Promise.all(
    paths.map(async (p) => {
      const absolutePath = resolve(options.directory, p);

      let result: number;
      switch (options.complexityStrategy) {
        case "cyclomatic":
          result = await calculateCyclomatic(absolutePath);
          break;
        case "halstead":
          result = await calculateHalstead(absolutePath);
          break;
        case "sloc":
        default:
          result = await computeSloc(absolutePath);
      }
      map.set(p, result);
    }),
  );
  return map;
}
export async function calculateHalstead(path: string) {
  switch (extname(path)) {
    case ".ts":
      return fromTypeScript(path);
    case ".mjs":
    case ".js":
      return fromJavaScript(path);
    default:
      internal.debug(
        "Unsupported file extension. Falling back on default complexity (1)"
      );
      return await computeSloc(path);
  }
}

export async function calculateCyclomatic(path: string) {
  switch (extname(path)) {
    case ".ts":
      return fromTypeScript(path);
    case ".mjs":
    case ".js":
      return fromJavaScript(path);
    default:
      internal.debug(
        "Unsupported file extension. Falling back on default complexity (1)"
      );
      return await computeSloc(path);
  }
}

function fromJavaScript(path: string): number {
  const content = readFileSync(path, { encoding: "utf8" });
  const babelResult = transformSync(content, {
    presets: ["@babel/preset-env"],
  });
  if (!babelResult) throw new Error(`Error while parsing file ${path}`);
  const result = escomplex.analyse(babelResult.code, {});
  return result.aggregate.halstead.volume;
}

function fromTypeScript(path: string): number {
  const content = readFileSync(path, { encoding: "utf8" });
  const babelResult = transformSync(content, {
    plugins: ["@babel/plugin-transform-typescript"],
    presets: ["@babel/preset-env"],
  });
  if (!babelResult) throw new Error(`Error while parsing file ${path}`);
  const result = escomplex.analyse(babelResult.code);
  return result.aggregate.halstead.volume;
}

async function computeSloc(absolutePath: string): Promise<number> {
  let result = await sloc({ path: absolutePath });
  if (result?.sloc) {
    return result?.sloc;
  } else {
    return countLineNumbers(absolutePath);
  }
}

async function countLineNumbers(absolutePath: string): Promise<number> {
  const ASCII_FOR_NEW_LINE = "10";
  const ASCII_FOR_CARRIAGE_RETURN = "13";

  let count = 0;
  return new Promise((resolve) => {
    createReadStream(absolutePath)
      .on("data", function (chunk) {
        for (let i = 0; i < chunk.length; ++i) {
          const char = chunk[i];
          // Use "==" instead of "===" to use type coercion
          if (char == ASCII_FOR_NEW_LINE || char == ASCII_FOR_CARRIAGE_RETURN) {
            count += 1;
          }
        }
      })
      .on("end", () => resolve(count))
  });
}
