import * as fs from "fs";
import * as path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { createTimer, notifyClose } from "./timer";
import { registerLogging } from "./logging";
import { registerProtocolHook } from "./protocol-hook";
import * as _ from "lodash";
import { NirvanaConfig, MainProcessOptions } from "../types/config";
const { Gaze } = require("gaze");

const opt: MainProcessOptions = JSON.parse(process.argv.splice(-1)[0]);
const defaultFixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");
let winList: Electron.BrowserWindow[] = [];

function createConfig(opt: MainProcessOptions): NirvanaConfig {
  const basePath = path.resolve(process.cwd(), opt.basePath || "./");
  return {
    target: opt.target,
    fixuteFileName: opt.customContextFile ? path.resolve(basePath, opt.customContextFile) : defaultFixuteFileName,
    concurrency: opt.concurrency || 4,
    captureConsole: true,
    colors: true,
    watch: opt.watch,
    browserNoActivityTimout: 1000,
    executionTimeout: 15000,
    basePath,
    windowOption: {
      show: !!opt.show,
      webPreferences: { } as  any,
    }
  };
}

const winMap: { [id: number]: Electron.BrowserWindow | null } = { };
const codeMap: { [id: number]: number } = { };

interface Watcher extends NodeJS.EventEmitter {
  close(): void;
}

function createWindow(config: NirvanaConfig, idx: number, filePatternsToWatch: string[]) {
  const { windowOption, watch, basePath } = config;
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
        win.loadURL("file://" + path.join(basePath, "__nirvana_fixture__") + "?__nirvana_index__=" + idx);
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

app.on("ready", () => {

  const conf = createConfig(opt);

  registerLogging();

  registerProtocolHook(conf.target, conf.fixuteFileName);

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

