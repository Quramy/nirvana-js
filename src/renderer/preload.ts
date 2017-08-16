import { ipcRenderer, remote } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as mkdirp from "mkdirp";
import { NirvanaConfig } from "../types/config";

const win = remote.getCurrentWindow();

function getConf(): NirvanaConfig {
  return ipcRenderer.sendSync("getConf") as NirvanaConfig;
}

function wrap(type: keyof typeof console) {
  const p = new Proxy(console[type], {
    apply: (target, thisArg, argumentsList) => {
      const args: any[] = Array.prototype.concat.apply([], argumentsList);
      const argsToSend = args.map(arg => {
        let flg = false;
        if (Array.isArray(arg)) {
          flg = true;
        } else if (typeof arg === "object") {
          flg = true;
        }
        if (flg) {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            // Nothing to do.
          }
        }
        return arg;
      });
      ipcRenderer.send("console", { type, id: win.id, rawArg: argsToSend });
      return target.apply(console, argumentsList);
    },
  });
  console[type] = p;
};

export function exit(code = 0) {
  ipcRenderer.send("exit", { id: win.id, code });
}

window.addEventListener("error", (e: ErrorEvent) => {
  ipcRenderer.send("error", {
    id: win.id,
    error: {
      message: e.error.message,
      stack: e.error.stack
    }
  });
});

ipcRenderer.on("reload", () => win.reload());

export const nirvana = {
  conf: getConf(),
  _ : {
    fs,
    path,
    remote,
    exit,
    mkdirp: mkdirp as any,
  },
};

export type NirvanaClient = typeof nirvana;

if (nirvana.conf.captureConsole) ["log", "warn", "error", "info", "debug"].forEach(wrap);
(window as any)["__is_nirvana__"] = true;
(window as any)["__nirvana__"] = nirvana;
