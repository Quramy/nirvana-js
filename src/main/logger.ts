export class Logger {

  level: "verbose" | "normal" | "silent" = "normal";

  verbose(...args: any[]) {
    if (this.level === "verbose") console.log.apply(console, args);
  }

  debug(...args: any[]) {
    if (this.level === "silent") return;
    console.debug.apply(console, args);
  }

  info(...args: any[]) {
    if (this.level === "silent") return;
    console.log.apply(console, args);
  }

  log(...args: any[]) {
    if (this.level === "silent") return;
    console.log.apply(console, args);
  }

  warn(...args: any[]) {
    if (this.level === "silent") return;
    console.warn.apply(console, args);
  }

  error(...args: any[]) {
    if (this.level === "silent") return;
    console.error.apply(console, args);
  }

  dir(...args: any[]) {
    if (this.level === "silent") return;
    console.dir.apply(console, args);
  }
}

const logger = new Logger;

export default logger;
