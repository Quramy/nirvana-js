import { NirvanaClient } from "./preload";

export function isNirvana() {
  if (typeof window !== "object") return false;
  return !!(window as any)["__is_nirvana__"];
}

export function getNirvana(): NirvanaClient | undefined {
  if (!isNirvana()) return undefined;
  return (window as any)["__nirvana__"] as NirvanaClient;
}

export function getCurrentWindow(): Electron.BrowserWindow | undefined {
  const nirvana = getNirvana();
  if (!nirvana) return;
  return nirvana.remote.getCurrentWindow();
}

export function exit(code = 0) {
  const nirvana = getNirvana();
  if (!nirvana) return;
  nirvana.exit(code);
}

export function screenshot(fname: string): Promise<undefined> {
  const nirvana = getNirvana();
  if (!nirvana) return Promise.resolve();
  const win = nirvana.remote.getCurrentWindow();
  if (!win) return Promise.resolve();
  const fs = nirvana.fs;
  const path = nirvana.path;
  const mkdirp = nirvana.mkdirp;
  const requestIdleCallback = (window as any)["requestIdleCallback"];
  return new Promise<undefined>((resolve, reject) => {
    requestIdleCallback(() => {
      win.capturePage(img => {
        const size = img.getSize();
        const ratio = window.devicePixelRatio;
        const png = img.resize({ width: size.width / ratio, height: size.height / ratio });
        mkdirp(path.dirname(fname), (err: any) => {
          if (err) {
            return reject(err);
          }
          fs.writeFile(fname, png.toPNG(), (saveErr: any) => {
            if (saveErr) {
              return reject(err);
            }
            resolve();
          });
        })
      })
    }, { timeout: 1000 });
  });
}
