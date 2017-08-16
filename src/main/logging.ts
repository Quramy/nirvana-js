import { ipcMain } from "electron";
import { tick } from "./timer";
import * as chalk from "chalk";
import logger from "./logger";

interface LogEventArgs {
  id: number;
  type: keyof typeof console;
  rawArg: any[];
}

interface ErrorEventArgs {
  id: number;
  error: Error;
}

function colMap(t: keyof typeof console): (x: string) => string {
  switch (t) {
    case "info":
    case "log":
      return chalk.green;
    case "warn":
      return chalk.yellow;
    case "error":
      return chalk.red;
    default:
      return (x: string) => x;
  }
}

export function registerLogging() {
  ipcMain.on("console", (e: Electron.IpcMessageEvent, args: LogEventArgs) => {
    if (!args) return;
    const t: keyof typeof console = args.type;
    if (args.id) tick(args.id);
    if (!t || !console[t]) return;
    const targets = args.rawArg.map(x => colMap(t)(x.toString()));
    ((logger as any)[t] as Function).apply(logger, [`[Log from window-${args.id}]`, ...targets]);
  });

  ipcMain.on("error", (e: Electron.IpcMessageEvent, args: ErrorEventArgs) => {
    if (!args) return;
    if (args.id) tick(args.id);
    logger.error(`[Error from window-${args.id}]`, chalk.red(args.error.message));
    if (args.error.stack) console.error(chalk.red(args.error.stack));
  });

}
