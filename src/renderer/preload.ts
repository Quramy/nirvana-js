import { ipcRenderer, remote } from "electron";

const win = remote.getCurrentWindow();

function wrap(type: keyof typeof console) {
  const orig = console[type];
  const wraped = function() {
    ipcRenderer.send("console", { type, id: win.id, rawArg: Array.prototype.concat.apply([], arguments) });
    return orig.apply(console, arguments);
  };
  console[type] = wraped;
};

["log", "warn", "error", "info", "debug"].forEach(wrap);
