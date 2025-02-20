import { spawn } from "node:child_process";

export type SpawnAsyncOutput = {
  code: number | null;
  output: string[];
}

export const spawnAsync = (command: string, args?: string[]) => {
  return new Promise<SpawnAsyncOutput>((resolve, reject) => {
    const child = spawn(command, args ?? []);
    let rawOutput = "";
    child.stdout?.on("data", (data) => {
      rawOutput += data.toString();
    });
    child.stderr?.on("data", (data) => {
      rawOutput += data.toString();
    });
    child.on("close", (code) => {
      let output = rawOutput.replaceAll("\r", "\n").split("\n").map((x) => x.trim()).filter((x) => x !== "");
      resolve({ code, output});
    });
  });
};
