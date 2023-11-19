import { lstatSync } from "node:fs";

import { Command, program } from "commander";

import { ComplexityStrategy, Format, Options, Sort } from "./types";
const pkg = import("../package.json");

export async function parse(): Promise<Options> {
  const { description, version } = await pkg;
  const cli = getRawCli(description, version).parse();
  if (!cli.args || !cli.args.length) {
    cli.help();
  }

  const options = cli.opts();
  const target = cli.args[0];
  try {
    lstatSync(target);
  } catch (e) {
    throw new Error("Argument 'target' is not a directory.");
  }
  return {
    target,
    directory: target,
    directories: options.directories,
    format: options.format ? (String(options.format) as Format) : "table",
    filter: options.filter || [],
    limit: options.limit ? Number(options.limit) : undefined,
    since: options.since ? String(options.since) : undefined,
    until: options.until ? String(options.until) : undefined,
    sort: options.sort ? (String(options.sort) as Sort) : undefined,
    complexityStrategy: options.complexityStrategy
      ? (String(options.complexityStrategy) as ComplexityStrategy)
      : "sloc",
  };
}

function getRawCli(description: string | undefined, version: string | undefined): Command {
  return program
    .name("code-complexity")
    .usage("<target> [options]")
    .argument("<target>")
    .version(version || "")
    .description(description || "")
    .option(
      "--filter <strings>",
      "list of globs (comma separated) to filter",
      (xs) => xs.split(',')
    )
    .option(
      "-cs, --complexity-strategy [sloc|cyclomatic|halstead]",
      "choose the complexity strategy to analyze your codebase with",
      /^(sloc|cyclomatic|halstead)$/i
    )
    .option(
      "-f, --format [format]",
      "format results using table or json",
      /^(table|json|csv)$/i
    )
    .option(
      "-l, --limit [limit]",
      "limit the number of files to output",
      parseInt
    )
    .option(
      "-i, --since [since]",
      "limit analysis to commits more recent in age than date"
    )
    .option(
      "-u, --until [until]",
      "limit analysis to commits older in age than date"
    )
    .option(
      "-s, --sort [sort]",
      "sort results (allowed valued: score, churn, complexity or file)",
      /^(score|churn|complexity|file)$/i
    )
    .option(
      "-d, --directories",
      "display values for directories instead of files"
    )
    .on("--help", () => {
      console.log();
      console.log("Examples:");
      console.log();
      [
        "$ code-complexity .",
        "$ code-complexity foo --limit 3",
        "$ code-complexity ../foo --sort score",
        "$ code-complexity /foo/bar --filter 'src/**,!src/front/**'",
        "$ code-complexity . --limit 10 --sort score",
        "$ code-complexity . --limit 10 --modules",
        "$ code-complexity . --limit 10 --sort score -cs halstead",
        "$ code-complexity . --since=2021-06-01 --limit 100",
        "$ code-complexity . --since=2021-04-01 --until=2021-07-01",
      ].forEach((example) => console.log(example.padStart(2)));
    });
}

