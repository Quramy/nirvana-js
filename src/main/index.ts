import * as fs from "fs";
import * as path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { createTimer, notifyClose } from "./timer";
import { registerLogging } from "./logging";
import { registerProtocolHook } from "./protocol-hook";
import * as _ from "lodash";
import { NirvanaConfig, MainProcessOptions, NirvanaConfigObject } from "../types/config";
import logger from "./logger";
const { Gaze } = require("gaze");

const defaultFixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");
let winList: Electron.BrowserWindow[] = [];

function createConfigObj(opt: MainProcessOptions, baseConf: NirvanaConfig): NirvanaConfig {
  const basePath = path.resolve(process.cwd(), opt.basePath || "./");
  const ret = { ...baseConf };
  if (opt.target) ret.target = opt.target;
  if (opt.customContextFile) {
    ret.customContextFile = path.resolve(basePath, opt.customContextFile);
  } else {
    ret.customContextFile = path.resolve(basePath, baseConf.customContextFile);
  }
  if (opt.concurrency) ret.concurrency = opt.concurrency;
  if (opt.captureConsole === false) ret.captureConsole = false;
  // if (opt.colors === false) ret.colors = false;
  if (!!opt.watch) ret.watch = true;
  opt.basePath = basePath;
  if (opt.show) ret.windowOption.show = true;
  if (opt.verbose) ret.verbose = true;
  return ret;
}

const defaultConfig: NirvanaConfig = {
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
  verbose: false,
};

function executeCustomConfigJS(scriptFilePath: string): Partial<NirvanaConfig> | undefined {
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

function verifyConfig(conf: NirvanaConfig) {
  let result = true;
  if (!conf.target.length) {
    console.error("Target script file should be specified");
    result = false;
  }
  return result;
}

const winMap: { [id: number]: Electron.BrowserWindow | null } = { };
const codeMap: { [id: number]: number } = { };

interface Watcher extends NodeJS.EventEmitter {
  close(): void;
}

function createWindow(config: NirvanaConfig, idx: number, filePatternsToWatch: string[]) {
  const { windowOption, watch, customContextFile } = config;
  let started = false;
  let position: { x?: number; y?: number } = { };
  const positionFile = path.join(app.getPath("userData"), `position_${idx}.json`);
  try {
    const p: number[] = JSON.parse(fs.readFileSync(positionFile, "utf-8"));
    position = { x: p[0], y: p[1] };
  } catch (e) { }
  return {
    start: () => {
      if (started) return Promise.resolve(-10);
      started = true;
      let gazeFileWather: Watcher;
      return new Promise((resolve, reject) => {
        const win = new BrowserWindow({
          ...position,
          ...windowOption,
          webPreferences: {
            preload: path.resolve(__dirname, "../renderer/preload.js"),
            ...windowOption.webPreferences,
          },
        });
        const id = win.id;
        if (!watch) {
          createTimer(win, opt);
        } else {
          gazeFileWather = new Gaze(filePatternsToWatch);
          gazeFileWather.on("changed", (changedFilePath: string) => win.webContents.send("reload"));
        }
        // win.loadURL("file://" + path.join(basePath, "__nirvana_fixture__") + "?__nirvana_index__=" + idx);
        const url = "file://" +  customContextFile + "?__nirvana_index__=" + idx;
        logger.verbose(url);
        win.loadURL(url);
        win.once("close", () => fs.writeFileSync(positionFile, JSON.stringify(win.getPosition()), "utf-8"));
        win.once("closed", () => {
          resolve(codeMap[id] || 0);
          if (gazeFileWather) gazeFileWather.close();
        });
        winMap[id] = win;
      })
    },
  };
}

const opt: MainProcessOptions = JSON.parse(process.argv.splice(-1)[0]);
app.on("ready", () => {

  let confBase: NirvanaConfig;
  if (opt.configFileName) {
    confBase = { ...defaultConfig, ...executeCustomConfigJS(opt.configFileName) };
  } else {
    confBase = defaultConfig;
  }
  const conf = createConfigObj(opt, confBase);

  if (conf.verbose) logger.level = "verbose";

  if (!verifyConfig(conf)) {
    return process.exit(1);
  }

  registerLogging();

  registerProtocolHook(conf);

  notifyClose.on("close", (id: number, code: number = 0) => {
    const win = winMap[id];
    if (!win || conf.watch) return;
    codeMap[id] = code;
    win.close();
    winMap[id] = null;
    delete winMap[id];
  });

  ipcMain.on("exit", (e: Electron.IpcMessageEvent, { id, code }: { id: number, code: number }) => {
    notifyClose.emit("close", id, code);
  });

  const windowList = opt.target.map((f, i) => createWindow(conf, i, [f]));
  const queues = _.range(conf.concurrency).map(i => {
    return windowList.reduce((queue, win) => {
      return queue.then((codes) => win.start().then(code => [code, ...codes]));
    }, Promise.resolve([] as number[]));
  });

  Promise.all(queues).then(codesList => {
    const nonzeroList = codesList.reduce((acc, l) => [...acc, ...l], []).filter(c => c > 0);
    if (nonzeroList.length) {
      process.exit(nonzeroList[nonzeroList.length - 1]);
    } else {
      process.exit(0);
    }
  });
});

