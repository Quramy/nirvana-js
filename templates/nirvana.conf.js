'use strict';

module.exports = {
  // scripts: ["a.js", "b.js"],       // Script files to run. Also glob syntax is available e.g. "*.spec.js"
  watch: false,                       // Watch script files and reload window when they are changed.
  concurrency: 4,                     // How many windows Nirvana launches in parallel.
  captureConsole: true,               // Whether to capture logging message in browser.
  // browserNoActivityTimout: 2000,   // Time period to close window [msec]. If you not want timeout closing, set zero.
  // contextFile: "my-context.html", // HTML context file.
  
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
