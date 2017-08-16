export interface MainProcessOptions {
  configFileName?: string;
  target: string[];
  show: boolean;
  watch: boolean;
  basePath?: string;
  noCaptureConsole?: boolean;
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
  executionTimeout: number;
  basePath: string;
  windowOption: {
    show: boolean;
    webPreferences: any;
  }
  loglevel: "verbose" | "info" | "silent";
}

export interface NirvanaConfig extends NirvanaConfigObject {
}
