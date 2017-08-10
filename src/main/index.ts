import { parse } from "url";
import * as fs from "fs";
import * as path from "path";
import { app, protocol, BrowserWindow } from "electron";
import { registerLogging } from "./logging";

export interface MainProcessOptions {
  target: string[];
}

const opt: MainProcessOptions = JSON.parse(process.argv.splice(-1)[0]);

console.log("hello, main.js", opt);
const fixuteFileName = path.resolve(__dirname, "../../assets/fixture.html");

function injectScript(html: string, targetScripts: string[]) {
  return html.replace(/<\/body>/g, (a, b, c) => {
    return targetScripts.map(name => `<script src="${name}"></script>`).join("\n") + "</body>";
  });
}

function protocolHook(targetFiles: string[]) {
  protocol.interceptStringProtocol("file", (request: Electron.InterceptStringProtocolRequest, cb) => {
    console.log(request);
    const parsedUrl = parse(request.url);
    if (!parsedUrl.pathname) return cb();
    fs.readFile(parsedUrl.pathname, "utf-8", (error, data) => {
      if (error) return (cb as any)(error.errno);
      if (parsedUrl.pathname === fixuteFileName) {
        const index = +parsedUrl.query.split("=")[1];
        data = injectScript(data, [targetFiles[index]]);
      }
      cb(data);
    })
  });
}

let winList: Electron.BrowserWindow[] = [];
app.on("ready", () => {
  registerLogging();
  protocolHook(opt.target);
  opt.target.forEach((file, i) => {
    const win = new BrowserWindow({
      webPreferences: {
        preload: path.resolve(__dirname, "../renderer/preload.js"),
      },
    });
    // TODO using config valule
    win.loadURL("file://" + fixuteFileName + "?index=" + i);
    winList.push(win);
  });
});

