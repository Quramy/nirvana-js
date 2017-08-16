export interface MainProcessOptions {
  configFileName?: string;
  target: string[];
  show: boolean;
  watch: boolean;
  basePath?: string;
  captureConsole?: boolean;
  concurrency?: number;
  customContextFile?: string;
  verbose?: boolean;
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
  verbose: boolean;
}

export interface NirvanaConfig extends NirvanaConfigObject {
}
