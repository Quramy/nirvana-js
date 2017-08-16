import { test } from "ava";
import { bootstrap } from "../cli/cli";

test("run hello-world", async t => {
  const code = await bootstrap({
    target: ["my-test.js"],
    configFileName: "nirvana.conf.js",
  }, __dirname + "/../../examples/jasmine");
  t.is(code, 1);
});
