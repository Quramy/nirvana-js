# ![Nirvana](./logo.png)

[![CircleCI](https://circleci.com/gh/Quramy/nirvana-js.svg?style=svg)](https://circleci.com/gh/Quramy/nirvana-js)
[![npm version](https://badge.fury.io/js/nirvana-js.svg)](https://badge.fury.io/js/nirvana-js)
[![Greenkeeper badge](https://badges.greenkeeper.io/Quramy/nirvana-js.svg)](https://greenkeeper.io/)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Quramy/nirvana-js/master/LICENSE)

JavaScript runner using Electron. It provides easy DOM manipulation with Node.js scripting :space_invader:.

## Getting started

```sh
$ npm -g istall electron nirvana-js
```

Then, write a script:

```js
// your-script.js
console.log(document.querySelector('body').innerHTML);
```

Finally exec the script with `nirvana` command :zap:

```sh
$ nirvana your-script.js
```

## Install

```sh
npm -g install electron nirvana-js
```

or

```sh
yarn global add electron nirvana-js
```

## Usage

```sh
nirvana [option] your-javascript.js [script2 script3 ...]
```

### CLI Options

- `c`, `config` : Configuration file path. See [Configuration File](#configuration-file) section at the below.
- `b`, `base-path` : The root path location to be used to resolve from.
- `w`, `watch` : Watch script files and reload window when they are changed.
- `v`, `verbose`: Display debug logging messages.
- `q`, `quiet` : Suppress logging messages.
- `init` : Generate configuration file.
- `show` : Whether to desplay browser windows.
- `custom-context-file`: HTML context file path.
- `concurrency` : How many windows Nirvana launches in parallel. Default `4`.
- `no-capture-console` : Suppress to capture logging message in browser.
- `no-timeout` : Suppress closing browser window via timeout.

### Configuration File
You can configure nirvana-js using a configuration JavaScript file. Executing `nirvana --init` the configuration file `nirvana.conf.js` is created. For example:

```js
'use strict';

module.exports = {
  // scripts: ["a.js", "b.js"],       // Script files to run. Also glob syntax is available e.g. "*.spec.js"
  watch: false,                       // Watch script files and reload window when they are changed.
  concurrency: 4,                     // How many windows Nirvana launches in parallel.
  captureConsole: true,               // Whether to capture logging message in browser.
  // browserNoActivityTimeout: 2000,   // Time period to close window [msec]. If you not want timeout closing, set zero.
  // contextFile: "my-context.html",  // HTML context file.
  
  // Electron BrowserWindow constructor option
  // If you want detail see https://electron.atom.io/docs/api/browser-window/#new-browserwindowoptions.
  windowOption: {
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      // If you use custom preload script, load 'nirvana-js/preload' in your preload script.
      // preload: 'preload.js'
    },
  },
};
```

## Client Utility Functions
In scripts to run on nirvana-js, some utility functions are available. For example:

```js
const { screenshot } = require('nirvana-js');

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
export declare function screenshot(fname: string): Promise<void>;
```


#### `export declare function isNirvana(): boolean;`



Tell whether the platform is running on nirvana-js.


#### `export declare function getCurrentWindow(): Electron.BrowserWindow | undefined;`



Get the current browser window.


<b>return</b> A Electron's BrowserWindow object


#### `export declare function exit(code?: number): void;`



Close the current browser process immediately.


<b>param</b> code: Exit code.


#### `export declare function screenshot(fname: string): Promise<void>;`



Captures a snapshot of the current window.


<b>param</b> fname: The location of captured PNG file.



<!-- end:doc -->

### Tips
#### When is browserWindow closed ?
By default, nirvana-js's main process is capturing browser windows' logging events. And if no logging event occurs for a certain period of time(specified `browserNoActivityTimeout`), the main process closes the browser window. If you want to suppress timeout closing, set `--no-timeout` CLI option. Or set `0` to `browserNoActivityTimeout` in nivana.conf.js.

If you want to close browserWindows manually, you should call the `exit` function included [client library](#export-declare-function-exitcode-number-void).

#### How to run testing framework ?
It's so easy. See example/jasmine .

## License
MIT. See license file under this repository.
