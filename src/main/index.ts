import * as fs from "fs";
import * as path from "path";
import { app, BrowserWindow } from "electron";
import { createTimer } from "./timer";
import { registerLogging } from "./logging";
import { registerProtocolHook } from "./protocol-hook";
import * as _ from "lodash";

export interface MainProcessOptions {
  configFileName?: string;
  target: string[];
  show: boolean;
  watch: boolean;
  concurrency?: number;
  customContextFile?: string;
}

const opt: MainProcessOptions = JSON.parse(process.argv.splice(-1)[0]);
const defaultFixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");
let winList: Electron.BrowserWindow[] = [];

function createConfig(opt: MainProcessOptions) {
  return {
    target: opt.target,
    fixuteFileName: opt.customContextFile ? path.resolve(process.cwd(), opt.customContextFile) : defaultFixuteFileName,
    concurrency: opt.concurrency || 4,
    captureConsole: true,
    colors: true,
    watch: opt.watch,
    browserNoActivityTimout: 1000,
    executionTimeout: 15000,
    windowOption: {
      show: !!opt.show,
      webPreferences: { } as  any,
    }
  };
}

function createWindow(windowOption: Electron.BrowserWindowConstructorOptions, watch: boolean, idx: number) {
  let started = false;
  let position: { x?: number; y?: number } = { };
  const positionFile = path.join(app.getPath("userData"), `position_${idx}.json`);
  try {
    const p: number[] = JSON.parse(fs.readFileSync(positionFile, "utf-8"));
    position = { x: p[0], y: p[1] };
  } catch (e) { }
  return {
    start: () => {
      if (started) return Promise.resolve(0);
      started = true;
      return new Promise((resolve, reject) => {
        const win = new BrowserWindow({
          ...position,
          ...windowOption,
          webPreferences: {
            ...windowOption.webPreferences,
            preload: path.resolve(__dirname, "../renderer/preload.js"),
          },
        });
        if (!watch) createTimer(win, opt);
        win.loadURL("file://" + path.join(process.cwd(), "__nirvana_fixture__") + "?__nirvana_index__=" + idx);
        win.once("close", () => {
          fs.writeFileSync(positionFile, JSON.stringify(win.getPosition()), "utf-8");
        });
        win.once("closed", () => resolve());
      })
    },
  };
}

app.on("ready", () => {
  const { target, fixuteFileName, concurrency, windowOption, watch } = createConfig(opt);
  registerLogging();
  registerProtocolHook(target, fixuteFileName);
  const windowList = opt.target.map((f, i) => createWindow(windowOption, watch, i));
  const queues = _.range(concurrency).map(i => {
    return windowList.reduce((queue, win) => {
      return queue.then(() => win.start());
    }, Promise.resolve(0));
  });
});

