import { ipcMain } from "electron";

export function registerLogging() {
  ipcMain.on("console", (e: Electron.IpcMessageEvent, args: any) => {
    if (!args) return;
    const t: keyof typeof console = args.type;
    if (!t || !console[t]) return;
    (console[t] as Function).apply(console, [`[Log from window-${args.id}]: `, ...args.rawArg]);
  });
}
