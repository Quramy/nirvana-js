export interface MainProcessOptions {
  configFileName?: string;
  target: string[];
  show: boolean;
  watch: boolean;
  basePath?: string;
  concurrency?: number;
  customContextFile?: string;
}

export interface NirvanaConfig {
  target: string[];
  fixuteFileName: string;
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
}
