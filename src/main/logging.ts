import { ipcMain } from "electron";
import { tick } from "./timer";
import * as chalk from "chalk";

interface LogEventArgs {
  id: number;
  type: keyof typeof console;
  rawArg: any[];
}

export function registerLogging() {
  ipcMain.on("console", (e: Electron.IpcMessageEvent, args: LogEventArgs) => {
    if (!args) return;
    const t: keyof typeof console = args.type;
    if (args.id) tick(args.id);
    if (!t || !console[t]) return;
    const targets = args.rawArg.map(x => chalk.green(x.toString()));
    (console[t] as Function).apply(console, [`[Log from window-${args.id}]`, ...targets]);
  });
}
