import { test } from "ava";
import { bootstrap } from "../cli/cli";

test("run hello-world", async t => {
  const code = await bootstrap({
    configFileName: "nirvana.conf.js",
  }, __dirname + "/../../examples/jasmine");
  t.is(code, 1);
});
