import * as path from "path";
import * as fs from "fs";
import { spawn } from "child_process";
import * as yargs from "yargs";
import * as chalk from "chalk";
import { MainProcessOptions } from "../types/config";
const cpf = require("cp-file");

export function bootstrap(cliOpt: Partial<MainProcessOptions>, cwd = process.cwd()) {
  return new Promise<number>((resolve, reject) => {
    const electronPath: string = (require("electron") as any);
    const optArgStr = JSON.stringify(cliOpt);
    const p = spawn(electronPath, [path.resolve(__dirname, "../main/index.js"), optArgStr], {
      cwd,
      stdio: "inherit",
    });
    p.on("exit", (code) => resolve(code));
    p.on("close", (code) => resolve(code));
    p.on("error", err => reject(err));
  });
}

export function main() {
  yargs
    .usage("Usage: $0 [options] script_file ... script_file")
    .options("h", { alias: "help" })
    .options("c", { alias: "config", desc: "Configuration file path.", string: true })
    .options("b", { alias: "base-path", desc: "The root path location to be used to resolve from.", string: true })
    .options("w", { alias: "watch", desc: "Watch script files and reload window when they are changed.", boolean: true, default: false })
    .options("v", { alias: "verbose", desc: "Display debug logging messages.", boolean: true, default: false })
    .options("q", { alias: "quiet", desc: "Suppress logging messages.", boolean: true, default: false })
    .options("init", { desc: "Generate configuration file.", boolean: true })
    .options("show", { desc: "Whether to desplay browser windows.", boolean: true, default: false })
    .options("concurrency", { desc: "How many windows Nirvana launches in parallel.", number: true, default: 4 })
    .options("no-capture-console", { alias: "no-capture-console", desc: "Suppress to capture logging message in browser.", boolean: true })
    .options("custom-context-file", { desc: "HTML context file.", string: true })
  ;
  const configFileName = yargs.argv.config || "nirvana.conf.js";
  const target = yargs.argv._;
  let hasConf =  fs.existsSync(configFileName);
  if (yargs.argv.init) {
    const tmpl = path.resolve(__dirname, "../../templates/nirvana.conf.js");
    const dist = "./nirvana.conf.js";
    cpf(tmpl, dist).then(() => {
      console.log(`Successfully created a configuration file to ${chalk.magenta("nirvana.conf.js")}`);
      process.exit(0);
    });
    return;
  }
  let p: Promise<number>;
  if (hasConf) {
    p = bootstrap({
      target,
      configFileName,
      ...yargs.argv,
    } as any);
  } else {
    if (!target || !target.length) {
      yargs.showHelp();
      return;
    }
    p = bootstrap({
      target,
      ...yargs.argv,
    } as any);
  }
  p.catch((reason: any) => {
    console.error("An error occures", reason);
    return 1;
  }).then(code => process.exit(code));
}
