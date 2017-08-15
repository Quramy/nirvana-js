const Nirvana = require("../../lib");

let code = 0;

const nirvanaReporter = {
  specDone: function(result) {
    if (result.status !== "passed") {
      code = 1;
    }
  },
  jasmineDone: function() {
    Nirvana.exit(code);
  }
};

module.exports = nirvanaReporter;
