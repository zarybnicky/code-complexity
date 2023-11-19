import * as Path from "node:path";
import { Options, Sort, Statistic } from "./types";

export function buildStatistics(
  files: string[],
  churns: Map<string, number>,
  complexities: Map<string, number>,
  options: Options
): Statistic[] {
  const statisticsForFiles: Statistic[] = files.map((path) => {
    const churn = churns.get(path) ?? 1;
    const complexity = complexities.get(path) ?? 1;
    return { path, churn, complexity, score: churn * complexity };
  });

  let result = options.directories
    ? buildDirectoryStatistics(statisticsForFiles)
    : statisticsForFiles;

  result = result.sort(sort(options.sort))
  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

function sort(sort: Sort | undefined) {
  return (statisticsA: Statistic, statisticsB: Statistic): number => {
    if (sort === "score" || sort === "ratio") {
      return statisticsB.score - statisticsA.score;
    }
    if (sort === "churn") {
      return statisticsB.churn - statisticsA.churn;
    }
    if (sort === "complexity") {
      return statisticsB.complexity - statisticsA.complexity;
    }
    if (sort === "file") {
      return statisticsA.path.localeCompare(statisticsB.path);
    }
    return 0;
  };
}

export function buildDirectoryStatistics(statisticsForFiles: Statistic[]): Statistic[] {
  const map = new Map<string, Statistic>();
  statisticsForFiles.forEach((statisticsForFile) => {
    findDirectoriesForFile(statisticsForFile.path).forEach((directoryForFile) => {
      const statisticsForDir = map.get(directoryForFile);
      const churn = statisticsForFile.churn + (statisticsForDir?.churn ?? 0);
      const complexity = statisticsForFile.complexity + (statisticsForDir?.complexity ?? 0);
      map.set(directoryForFile, { path: directoryForFile, churn, complexity, score: churn * complexity });
    });
  });
  return [...map.values()];
}

export function findDirectoriesForFile(path: string): string[] {
  const directories: string[] = [];
  const pathChunks = Path.parse(path).dir.split(Path.sep);
  pathChunks.forEach((chunk) => {
    const parentDir = directories.slice(-1);
    const directory = parentDir.length ? parentDir + Path.sep + chunk : chunk;
    if (directory.length > 0) {
      directories.push(directory);
    }
  });
  return directories;
}
