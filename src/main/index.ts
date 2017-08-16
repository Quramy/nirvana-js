import * as fs from "fs";
import * as path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { createTimer } from "./timer";
import { EventEmitter } from "events";
import { registerLogging } from "./logging";
import { registerProtocolHook } from "./protocol-hook";
import * as glob from "glob";
import * as _ from "lodash";
import { NirvanaConfig, MainProcessOptions, NirvanaConfigObject } from "../types/config";
import logger from "./logger";
import { verifyConfig, defaultConfig, createConfigObj, executeCustomConfigJS } from "./configuration";
const { Gaze } = require("gaze");

let winList: Electron.BrowserWindow[] = [];

const winMap: { [id: number]: Electron.BrowserWindow | null } = { };
const codeMap: { [id: number]: number } = { };

interface Watcher extends NodeJS.EventEmitter {
  close(): void;
}

export const notifyClose = new EventEmitter();

function createWindow(conf: NirvanaConfig, idx: number, filePatternsToWatch: string[]) {
  const { windowOption, watch, contextFile, browserNoActivityTimeout } = conf;
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
        if (!watch && browserNoActivityTimeout > 0) {
          createTimer(id, () => {
            logger.verbose(`window-${id} close via no activity timeout`);
            notifyClose.emit("close", id, 0);
          }, conf);
        } else {
          gazeFileWather = new Gaze(filePatternsToWatch);
          gazeFileWather.on("changed", (changedFilePath: string) => win.webContents.send("reload"));
        }
        const url = "file://" +  contextFile + "?__nirvana_index__=" + idx;
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

function globp(p: string, cwd: string) {
  return new Promise<string[]>((res, rej) => {
    glob(p, { cwd }, (err, list) => {
      if (err) return rej(err);
      res(list);
    });
  }).then(list => list.map(item => path.resolve(cwd, item)))
  ;
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

  logger.level = conf.loglevel;
  logger.verbose("conf:", conf);

  if (!verifyConfig(conf)) {
    return process.exit(1);
  }

  if (conf.captureConsole) registerLogging();

  notifyClose.on("close", (id: number, code: number = 0) => {
    const win = winMap[id];
    if (!win || conf.watch) return;
    codeMap[id] = code;
    win.close();
    winMap[id] = null;
    delete winMap[id];
  });

  ipcMain.on("getConf", (e: Electron.IpcMessageEvent) => {
    e.returnValue = conf;
  });

  ipcMain.on("exit", (e: Electron.IpcMessageEvent, { id, code }: { id: number, code: number }) => {
    notifyClose.emit("close", id, code);
  });

  Promise.all(conf.target.map(p => globp(p, conf.basePath)))
    .then(listlist => _.uniq(_.flatten(listlist)))
    .then(scriptList => {
      logger.verbose("Target scripts:", scriptList);
      registerProtocolHook(scriptList, conf);
      const windowList = scriptList.map((f, i) => createWindow(conf, i, [f]));
      const queues = _.range(conf.concurrency).map(i => {
        return windowList.reduce((queue, win) => {
          return queue.then((codes) => win.start().then(code => [code, ...codes] as number[]));
        }, Promise.resolve<number[]>([] as number[]));
      });
      return Promise.all(queues);
    })
    .then(codesList => {
      const nonzeroList = codesList.reduce((acc, l) => [...acc, ...l], []).filter(c => c > 0);
      if (nonzeroList.length) {
        process.exit(nonzeroList[nonzeroList.length - 1]);
      } else {
        process.exit(0);
      }
    })
  ;

});

