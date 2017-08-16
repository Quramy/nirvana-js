import * as path from "path";
import * as fs from "fs";
import { parse, Url } from "url";
import { protocol } from "electron";
import { NirvanaConfig } from "../types/config";
import logger from "./logger";

export function registerProtocolHook(conf: NirvanaConfig) {
  function protocolHook(targetFiles: string[]) {
    protocol.interceptBufferProtocol("file", (request: Electron.InterceptStringProtocolRequest, cb) => {
      const parsedUrl = parse(request.url);
      const fname = url2mapper(parsedUrl);
      logger.verbose("Capture buffer request", request.url);
      if (!fname) return cb();
      fs.readFile(fname, (error, buf) => {
        if (error) return (cb as any)(error.errno);
        if (fname === conf.customContextFile) {
          const tmp = (<string>parsedUrl.query).split("&").map(c => {
            const p = c.split("=");
            return { key: p[0], value: p[1] };
          }).find(p => p.key === "__nirvana_index__");
          if (tmp) {
            const index = +tmp.value;
            buf = new Buffer(injectScript(buf.toString("utf-8"), [targetFiles[index]]));
          }
        }
        cb(buf);
      })
    });
  }

  function injectScript(html: string, targetScripts: string[]) {
    logger.verbose("Inject scripts into context HTML", targetScripts);
    return html.replace(/<\/body>/g, (a, b, c) => {
      return targetScripts.map(name => `<script>require("${name}")</script>`).join("\n") + "</body>";
    });
  }

  function url2mapper(url: Url) {
    // if (!url.pathname) return;
    // if (url.pathname.split("/").slice(-1)[0] === "__nirvana_fixture__") {
    //   return cont.config;
    // }
    return url.pathname;
  }

  protocolHook(conf.target.map(t => path.resolve(conf.basePath, t)));
}
