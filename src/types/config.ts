export interface MainProcessOptions {
  configFileName?: string;
  target: string[];
  show: boolean;
  watch: boolean;
  basePath?: string;
  noCaptureConsole?: boolean;
  noTimeout?: boolean;
  concurrency?: number;
  customContextFile?: string;
  verbose?: boolean;
  quiet?: boolean;
}

export interface NirvanaConfigObject {
  target: string[];
  customContextFile: string;
  concurrency: number;
  captureConsole: boolean;
  colors: boolean;
  watch: boolean;
  browserNoActivityTimout: number;
  basePath: string;
  windowOption: Electron.BrowserWindowConstructorOptions;
  loglevel: "verbose" | "info" | "silent";
}

export interface NirvanaConfig extends NirvanaConfigObject {
}
