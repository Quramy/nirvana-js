'use strict';

module.exports = {
  watch: false,       // Watch script files and reload window when they are changed.
  concurrency: 4,     // How many windows Nirvana launches in parallel.
  captureConsole: true,      // Whether to capture logging message in browser.
  // browserNoActivityTimout: 2000,  // Time period to close window [msec]. If you not want timeout closing, set zero.
  // customContextFile: "my-context.html", // HTML context file.
  
  // Electron BrowserWindow constructor option
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

