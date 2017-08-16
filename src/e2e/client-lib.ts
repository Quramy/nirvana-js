import { test } from "ava";
import * as fs from "fs";
import { bootstrap } from "../cli/cli";
import * as rimraf from "rimraf";

test.serial("run exit", async t => {
  const code = await bootstrap({
    target: ["../../examples/client-lib/exit.js"],
  }, __dirname);
  t.is(code, 111);
});

test.serial("run screenshot", async t => {
  const capturePath = __dirname + "/../../examples/client-lib/capture.png"
  rimraf.sync(capturePath);
  const code = await bootstrap({
    target: ["../../examples/client-lib/screenshot.js"],
  }, __dirname);
  t.notThrows(() => fs.statSync(capturePath));
});
