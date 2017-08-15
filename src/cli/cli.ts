import * as path from "path";
import * as fs from "fs";
import { spawn } from "child_process";
import * as yargs from "yargs";

function bootstrap(electronOpt: any) {
  const electronPath: string = (require("electron") as any);
  const optArgStr = JSON.stringify(electronOpt);
  const p = spawn(electronPath, [path.resolve(__dirname, "../main/index.js"), optArgStr], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
  p.on("exit", (code) => process.exit(code));
  p.on("close", (code) => process.exit(code));
  p.on("error", err => console.error("An error occures on " + p.pid + ", " + err));
}

function main() {
  yargs
    .usage("Usage: $0 [options]")
    .options("h", { alias: "help" })
    .options("c", { alias: "config", desc: "Configuration file path.", string: true })
    .options("b", { alias: "base-path", desc: "The root path location to be used to resolve from.", string: true })
    .options("w", { alias: "watch", desc: "Watch mode", boolean: true, default: false })
    .options("show", { desc: "Whether to desplay browser windows." , boolean: true, default: false })
    .options("concurrency", { desc: "How many windows Nirvana launches in parallel." , number: true, default: 4 })
    .options("capture-console", { desc: "Whether to capture logging message in browser.." , boolean: true, default: true })
    .options("custom-context-file", { desc: "HTML context file.", string: true })
  ;
  const configFileName = yargs.argv.config || "nirvana.conf.js";
  const target = yargs.argv._;
  let hasConf =  fs.existsSync(configFileName);
  if (hasConf) {
    bootstrap({
      target,
      configFileName,
      ...yargs.argv,
    });
  } else {
    if (!target || !target.length) {
      yargs.showHelp();
      return;
    }
    bootstrap({
      target,
      ...yargs.argv,
    });
  }
}

main();
