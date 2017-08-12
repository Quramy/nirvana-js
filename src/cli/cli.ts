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
    .options("w", { alias: "watch", desc: "Watch mode", boolean: true, default: false })
    .options("show", { desc: "custom-context-file" , boolean: true, default: false })
    .options("concurrency", { desc: "Concurrency size" , number: true, default: 4 })
    .options("custom-context-file", { desc: "custom-context-file" })
  ;
  const configFileName = yargs.argv.config;
  const target = yargs.argv._;
  if (!target || !target.length) {
    yargs.showHelp();
    return;
  }
  bootstrap({
    target,
    ...yargs.argv,
  });
}

main();
