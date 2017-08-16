import { NirvanaClient } from "./preload";

/**
 *
 * Tell whether the platform is running on nirvana-js.
 *
 **/
export function isNirvana() {
  if (typeof window !== "object") return false;
  return !!(window as any)["__is_nirvana__"];
}

/**
 *
 * Get the current browser window.
 *
 * @return A Electron's BrowserWindow object
 *
 **/
export function getCurrentWindow(): Electron.BrowserWindow | undefined {
  const nirvana = getNirvana();
  if (!nirvana) return;
  return nirvana._.remote.getCurrentWindow();
}

/**
 *
 * Close the current browser process immediately.
 *
 * @param code: Exit code.
 *
 **/
export function exit(code = 0) {
  const nirvana = getNirvana();
  if (!nirvana) return;
  nirvana._.exit(code);
}

/**
 *
 * Captures a snapshot of the current window.
 *
 * @param fname: The location of captured PNG file.
 *
 **/
export function screenshot(fname: string): Promise<void> {
  const nirvana = getNirvana();
  if (!nirvana) return Promise.resolve();
  const win = nirvana._.remote.getCurrentWindow();
  if (!win) return Promise.resolve();
  const fs = nirvana._.fs;
  const path = nirvana._.path;
  const mkdirp = nirvana._.mkdirp;
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

function getNirvana(): NirvanaClient | undefined {
  if (!isNirvana()) return undefined;
  return (window as any)["__nirvana__"] as NirvanaClient;
}
