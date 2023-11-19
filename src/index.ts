import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import * as Table from "cli-table3";

import { parse } from "./cli";
import { buildStatistics } from "./statistics";
import { buildGitHistory } from "./githistory";
import { buildComplexity } from "./complexities";
import { Options, Statistic } from "./types";

export default async function main(): Promise<void> {
  const options = await parse();

  if (options.complexityStrategy !== "sloc") {
    console.warn(
      "Beware, the 'halstead' and 'cyclomatic' strategies are only available for JavaScript/TypeScript."
    );
  }
  try {
    execSync("which git");
  } catch (error) {
    throw new Error("Program 'git' must be installed");
  }
  if (!existsSync(`${options.directory}/.git`)) {
    throw new Error(`Argument 'dir' must be the git root directory.`);
  }

  const gitHistory = buildGitHistory(options);
  const complexities = await buildComplexity(gitHistory.files, options);

  const statistics = buildStatistics(
    gitHistory.files,
    gitHistory.churnByPath,
    complexities,
    options
  );
  render(statistics, options);
}

export function render(statistics: Statistic[], options: Options): void {
  switch (options.format) {
    case "json":
      console.log(JSON.stringify(statistics));
      break;
    case "csv":
      console.log(toCSV(statistics));
      break;
    case "table":
    default:
      console.log(toTable(statistics));
      break;
  }
}

function toTable(statistics: Statistic[]): string {
  const table = new Table({
    head: ["file", "complexity", "churn", "score"],
    style: {
      compact: true,
    },
  });
  statistics.forEach((statistics) => {
    table.push([
      statistics.path,
      statistics.complexity,
      statistics.churn,
      statistics.score,
    ]);
  });
  return table.toString();
}

function toCSV(statistics: Statistic[]): string {
  let csv = "file,complexity,churn,score\n";
  statistics.forEach((stat) => {
    csv +=
      [stat.path, stat.complexity, stat.churn, stat.score].join(",") + "\n";
  });
  return csv;
}
