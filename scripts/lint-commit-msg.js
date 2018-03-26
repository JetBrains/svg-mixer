const fs = require('fs');
const util = require('util');

const { lint, load, format } = require('@commitlint/core');

const readFileAsync = util.promisify(fs.readFile);

Promise.all([load(), readFileAsync(process.env.GIT_PARAMS, 'utf8')])
  .then(tasks => {
    const [{ rules, parserPreset }, commitMsg] = tasks;
    return lint(
      commitMsg,
      rules,
      parserPreset ? { parserOpts: parserPreset.parserOpts } : {}
    );
  })
  .then(report => {
    console.log(format(report, { color: true }).join('\n'));
    console.log(`Valid: ${report.valid}`);
    process.exit(report.valid ? 0 : -1);
  })
  .catch(e => {
    console.log(`Something wrong ${e.message}`);
    process.exit(-1);
  });
