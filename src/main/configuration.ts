import * as fs from "fs";
import * as path from "path";
import { MainProcessOptions, NirvanaConfig, CustomConfig } from "../types/config";
import * as chalk from "chalk";
import logger from "./logger";

const defaultFixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");
export function createConfigObj(opt: MainProcessOptions, baseConf: NirvanaConfig): NirvanaConfig {
  const basePath = opt.basePath ? path.resolve(process.cwd(), opt.basePath || "./") : baseConf.basePath;
  const ret = { ...baseConf };
  if (opt.target && opt.target.length) ret.target = opt.target;
  if (opt.customContextFile) {
    ret.contextFile = path.resolve(basePath, opt.customContextFile);
  } else {
    ret.contextFile = path.resolve(basePath, baseConf.contextFile);
  }
  if (opt.concurrency) ret.concurrency = opt.concurrency;
  if (opt.noCaptureConsole) ret.captureConsole = false;
  // if (opt.colors === false) ret.colors = false;
  if (opt.watch) ret.watch = true;
  opt.basePath = basePath;
  if (opt.show) ret.windowOption.show = true;
  if (opt.verbose) {
    ret.loglevel = "verbose";
  } else if (opt.quiet) {
    ret.loglevel = "silent";
  } else {
    ret.loglevel = "info";
  }
  if (opt.noTimeout) {
    ret.browserNoActivityTimeout = -1;
  }
  return ret;
}

export const defaultConfig: NirvanaConfig = {
  basePath: process.cwd(),
  target: [],
  browserNoActivityTimeout: 1000,
  captureConsole: true,
  colors: true,
  concurrency: 4,
  contextFile: defaultFixuteFileName,
  watch: false,
  windowOption: {
    show: false,
    webPreferences: { },
  },
  loglevel: "info",
};

function specifyTarget(arg: CustomConfig["scripts"]): string[] {
  if (!arg) return [];
  let x: string | string[];
  if (typeof arg === "function") {
    x = arg();
  } else {
    x = arg;
  }
  if (Array.isArray(x)) {
    return x;
  } else {
    return [x];
  }
}

export function executeCustomConfigJS(scriptFilePath: string): Partial<NirvanaConfig> | undefined {
  try {
    const fp = path.resolve(process.cwd(), scriptFilePath);
    const basePath = path.dirname(fp);
    const result = require(fp);
    let conf: CustomConfig = { };
    if (typeof result === "object") {
      conf = result;
    } else if (typeof result === "function") {
      conf = result();
    }
    return {
      basePath,
      target: specifyTarget(conf.scripts),
      ...conf
    } as any;
  } catch (e) {
  }
}

export function verifyConfig(conf: NirvanaConfig) {
  let result = true;
  if (!conf.target.length) {
    logger.error(chalk.red("One or more script files should be specified."));
    result = false;
  }
  return result;
}
