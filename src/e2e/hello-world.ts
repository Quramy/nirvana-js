import { test } from "ava";
import { bootstrap } from "../cli/cli";

test("run hello-world", async t => {
  const code = await bootstrap({
    target: ["../../examples/hello-world/script.js"],
  }, __dirname);
  t.is(code, 0);
});
