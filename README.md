# ![Nirvana](./logo.png)

[![npm version](https://badge.fury.io/js/nirvana-js.svg)](https://badge.fury.io/js/nirvana-js)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Quramy/nirvana-js/master/LICENSE)

JavaScript runner using Electron.

## Install

```sh
npm -g install electron nirvana-js
```

## Usage

```sh
nirvana [option] your-javascript.js [script2 script3 ...]
```

### CLI Options

- `c`, `config` : Configuration file path. See [Configuration File](#configuration-file) section at the below.
- `b`, `base-path` : The root path location to be used to resolve from.
- `w`, `watch` : Watch script files and reload window when they are changed.
- `init` : Generate configuration file.
- `show` : Whether to desplay browser windows. Default `false`.
- `concurrency` : How many windows Nirvana launches in parallel. Default `4`.
- `capture-console` : Whether to capture logging message in browser. Default: `true`.
- `custom-context-file`: HTML context file path.

### Configuration File

You can configure nirvana-js using a configuration JavaScript file such as:

```js
module.exports = {
  show: true,
  watch: true,
  customContextFile: "my-context.html"
};
```

## Client Utility Functions
In scripts to run on nirvana-js, some utility functions are available. For example:

```js
const { screenshot } from 'nirvana-js';

function yourFunc() {
  doSomething();
  screenshot('my-capture.png');
}
```
<!-- doc -->
<!-- THIS DOCUMENT IS AUTOMATICALLY GENERATED FROM src/*.ts -->
<!-- Please edit src/*.ts and `npm run build:docs:api` -->


### Interface

```typescript
export declare function isNirvana(): boolean;
export declare function getCurrentWindow(): Electron.BrowserWindow | undefined;
export declare function exit(code?: number): void;
export declare function screenshot(fname: string): Promise<undefined>;
```


#### `export declare function isNirvana(): boolean;`



Tell whether the platform is running on nirvana-js.


#### `export declare function getCurrentWindow(): Electron.BrowserWindow | undefined;`



Get the current browser window.


<b>return</b> A Electron's BrowserWindow object


#### `export declare function exit(code?: number): void;`



Close the current browser process immediately.


<b>param</b> code: Exit code.


#### `export declare function screenshot(fname: string): Promise<undefined>;`



Captures a snapshot of the current window.


<b>param</b> fname: The location of captured PNG file.



<!-- end:doc -->

## License
MIT. See license file under this repository.
