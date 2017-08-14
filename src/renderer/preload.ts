import { ipcRenderer, remote } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as mkdirp from "mkdirp";

const win = remote.getCurrentWindow();

function wrap(type: keyof typeof console) {
  const p = new Proxy(console[type], {
    apply: (target, thisArg, argumentsList) => {
      ipcRenderer.send("console", { type, id: win.id, rawArg: Array.prototype.concat.apply([], argumentsList) });
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

export const nirvana = {
  fs,
  path,
  remote,
  exit,
  mkdirp: mkdirp as any,
};

export type NirvanaClient = typeof nirvana;

["log", "warn", "error", "info", "debug"].forEach(wrap);
(window as any)["__is_nirvana__"] = true;
(window as any)["__nirvana__"] = nirvana;
(window as any).Nirvana = nirvana;
