#!/bin/bash
declare projectDir=$(git rev-parse --show-toplevel)
declare srcDir="${projectDir}/lib"
declare docDir="${projectDir}/docs"
# add build result
function addDoc(){
    declare filePath=$1;
    declare fileName=$(basename ${filePath} "d.ts")
    $(npm bin)/docco --blocks -t ${projectDir}/tools/d.ts-markdown.jst ${filePath} --output ${projectDir}/__obj/docs
    mv ${projectDir}/__obj/docs/**${fileName}*.html ${projectDir}/docs/api/${fileName}md
    echo "Create: ${docDir}/api/${fileName}md"
}
# npm run build
# update
addDoc "${srcDir}/renderer/client-fns.d.ts"

cat << JS | node
const fs = require("fs");
const readme = fs.readFileSync("$projectDir/README.md", "utf-8");
const doc = fs.readFileSync("$projectDir/__obj/docs/lib-renderer-client-fns.d.html", "utf-8");

let ret = [];
let inDoc = false;
readme.split("\n").forEach(line => {
  if (line === "<!-- doc -->") {
    inDoc = true;
    ret.push(line);
    ret = [...ret, ...doc.split("\n")];
  }
  
  if (line === "<!-- end:doc -->") {
    inDoc = false;
  }
  
  if (!inDoc) {
    ret.push(line);
  }
});

fs.writeFileSync("$projectDir/README.md", ret.join("\n"), "utf-8");

JS
