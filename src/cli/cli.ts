import * as path from "path";
import { spawn } from "child_process";
import * as yargs from "yargs";

function bootstrap(electronOpt: any) {
  const electronPath: string = (require("electron") as any);
  const optArgStr = JSON.stringify(electronOpt);
  const p = spawn(electronPath, [path.resolve(__dirname, "../main/index.js"), optArgStr], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

function main() {
  yargs
    .usage("Usage: $0 [options]")
    .options("h", { alias: "help" })
    .options("c", { alias: "config", desc: "Configuration file path"})
    .options("custom-context-file", { desc: "custom-context-file" })
  ;
  const configFileName = yargs.argv.config;
  const { customContextFile } = yargs.argv;
  const target = yargs.argv._;
  if (!target || !target.length) {
    yargs.showHelp();
    return;
  }
  bootstrap({
    target,
    configFileName,
    customContextFile,
  });
}

main();
