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
  ;
  const { } = yargs.argv;
  const target = yargs.argv._;
  // console.log(yargs.argv);
  if (!target || !target.length) {
    yargs.showHelp();
    return;
  }

  bootstrap({
    target,
  });
}

main();
