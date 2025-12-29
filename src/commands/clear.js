/**
 * Clear/reset context for a project
 */

const readline = require('readline');
const { getProjectName, getContextFilePath } = require('../config');
const storage = require('../storage/local');

async function clear(options = {}) {
  const { global: isGlobal } = options;
  const projectName = isGlobal ? 'global' : getProjectName(process.cwd());

  const stats = storage.getContextStats(projectName, isGlobal);

  if (!stats) {
    console.log(`\nNo context found for ${isGlobal ? 'global' : projectName}.`);
    return;
  }

  const total = Object.values(stats.sections).reduce((a, b) => a + b, 0);

  console.log(`\nThis will delete context for: ${isGlobal ? 'GLOBAL' : projectName}`);
  console.log(`  - ${total} items`);
  console.log(`  - ${stats.lines} lines`);
  console.log(`  - File: ${stats.path}`);

  const confirmed = await confirm('\nAre you sure? (y/N): ');

  if (confirmed) {
    storage.deleteContext(projectName, isGlobal);
    console.log(`\nContext cleared.`);
  } else {
    console.log(`\nCancelled.`);
  }
}

function confirm(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

module.exports = { clear };
