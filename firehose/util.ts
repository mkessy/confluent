import fs from "fs";
import readline from "readline";
import { ParsedKafkaConfig } from "./types";

function readAllLines(path: string) {
  return new Promise<string[]>((resolve, reject) => {
    // Test file access directly, so that we can fail fast.
    // Otherwise, an ENOENT is thrown in the global scope by the readline internals.
    try {
      fs.accessSync(path, fs.constants.R_OK);
    } catch (err) {
      reject(err);
    }

    let lines: string[] = [];

    const reader = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity,
    });

    reader
      .on("line", (line) => lines.push(line))
      .on("close", () => resolve(lines));
  });
}

export async function configFromPath(path: string) {
  const lines = await readAllLines(path);

  return lines
    .filter((line) => !/^\s*?#/.test(line))
    .map((line) => line.split("=").map((s) => s.trim()))
    .reduce((config: Record<string, string>, [k, v]) => {
      config[k] = v;
      return config;
    }, {});
}
