import * as path from "path";
import { app, BrowserWindow } from "electron";
import { createTimer } from "./timer";
import { registerLogging } from "./logging";
import { registerProtocolHook } from "./protocol-hook";

export interface MainProcessOptions {
  configFileName?: string;
  target: string[];
  customContextFile?: string;
}

const opt: MainProcessOptions = JSON.parse(process.argv.splice(-1)[0]);
const defaultFixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");
let winList: Electron.BrowserWindow[] = [];

function createConfig(opt: MainProcessOptions) {
  return {
    target: opt.target,
    fixuteFileName: opt.customContextFile ? path.resolve(process.cwd(), opt.customContextFile) : defaultFixuteFileName,
    concurrency: 1,
    captureConsole: true,
    colors: true,
    browserNoActivityTimout: 1000,
    executionTimeout: 15000,
    windowOption: {
      show: false,
      webPreferences: { } as  any,
    }
  };
}

app.on("ready", () => {
  const { target, fixuteFileName, windowOption } = createConfig(opt);
  registerLogging();
  registerProtocolHook(target, fixuteFileName);
  opt.target.forEach((file, i) => {
    const win = new BrowserWindow({
      ...windowOption,
      webPreferences: {
        ...windowOption.webPreferences,
        preload: path.resolve(__dirname, "../renderer/preload.js"),
      },
    });
    createTimer(win, opt);
    win.loadURL("file://" + path.join(process.cwd(), "__fixture__") + "?index=" + i);
    winList.push(win);
  });
});

