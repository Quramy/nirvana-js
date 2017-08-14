const { exit, screenshot } = require("../../lib");
screenshot(__dirname + "/capture.png").then(() => exit());
