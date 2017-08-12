import { ipcRenderer, remote } from "electron";

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

window.addEventListener("error", (e: ErrorEvent) => {
  ipcRenderer.send("error", {
    id: win.id,
    error: {
      message: e.error.message,
      stack: e.error.stack
    }
  });
});

["log", "warn", "error", "info", "debug"].forEach(wrap);
