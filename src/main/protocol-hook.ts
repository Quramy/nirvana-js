import { parse, Url } from "url";
import * as fs from "fs";
import { protocol } from "electron";

export function registerProtocolHook(targetFiles: string[], fixuteFileName: string) {
  function protocolHook(targetFiles: string[]) {
    protocol.interceptStringProtocol("file", (request: Electron.InterceptStringProtocolRequest, cb) => {
      const parsedUrl = parse(request.url);
      const fname = url2mapper(parsedUrl);
      if (!fname) return cb();
      fs.readFile(fname, "utf-8", (error, data) => {
        if (error) return (cb as any)(error.errno);
        if (fname === fixuteFileName) {
          const index = +parsedUrl.query.split("=")[1];
          data = injectScript(data, [targetFiles[index]]);
        }
        cb(data);
      })
    });
  }

  function injectScript(html: string, targetScripts: string[]) {
    return html.replace(/<\/body>/g, (a, b, c) => {
      return targetScripts.map(name => `<script src="${name}"></script>`).join("\n") + "</body>";
    });
  }

  function url2mapper(url: Url) {
    if (!url.pathname) return;
    if (url.pathname.split("/").slice(-1)[0] === "__fixture__") {
      return fixuteFileName;
    }
    return url.pathname;
  }

  protocolHook(targetFiles);
}
