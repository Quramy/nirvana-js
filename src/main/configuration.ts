import * as fs from "fs";
import * as path from "path";
import { MainProcessOptions, NirvanaConfig } from "../types/config";

const defaultFixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");
export function createConfigObj(opt: MainProcessOptions, baseConf: NirvanaConfig): NirvanaConfig {
  const basePath = path.resolve(process.cwd(), opt.basePath || "./");
  const ret = { ...baseConf };
  if (opt.target) ret.target = opt.target;
  if (opt.customContextFile) {
    ret.customContextFile = path.resolve(basePath, opt.customContextFile);
  } else {
    ret.customContextFile = path.resolve(basePath, baseConf.customContextFile);
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
  return ret;
}

export const defaultConfig: NirvanaConfig = {
  basePath: process.cwd(),
  target: [],
  browserNoActivityTimout: 1000,
  executionTimeout: 15000,
  captureConsole: true,
  colors: true,
  concurrency: 4,
  customContextFile: defaultFixuteFileName,
  watch: false,
  windowOption: {
    show: false,
    webPreferences: { },
  },
  loglevel: "info",
};

export function executeCustomConfigJS(scriptFilePath: string): Partial<NirvanaConfig> | undefined {
  try {
    const result = require(path.resolve(process.cwd(), scriptFilePath));
    let conf: Partial<NirvanaConfig>;
    if (typeof result === "object") {
      conf = result;
      return conf;
    } else if (typeof result === "function") {
      conf = result();
      return conf;
    }
  } catch (e) {
  }
}

export function verifyConfig(conf: NirvanaConfig) {
  let result = true;
  if (!conf.target.length) {
    console.error("Target script file should be specified");
    result = false;
  }
  return result;
}
