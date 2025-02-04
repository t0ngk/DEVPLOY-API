import { spawn } from "node:child_process";

export const spawnAsync = (command: string, args?: string[]) => {
  return new Promise<string[]>((resolve, reject) => {
    const child = spawn(command, args ?? []);
    let output:string[] = [];
    child.stdout?.on("data", (data) => {
      output.push(data.toString());
    });
    child.stderr?.on("data", (data) => {
      output.push(data.toString());
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}: ${output}`));
      }
    });
  });
}
