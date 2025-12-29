/**
 * Show full context content
 */

const { getProjectName } = require('../config');
const storage = require('../storage/local');

async function show(options = {}) {
  const { global: isGlobal } = options;
  const projectName = isGlobal ? 'global' : getProjectName(process.cwd());

  const content = storage.loadContext(projectName, isGlobal);

  if (!content) {
    console.log(`\nNo context found for ${isGlobal ? 'global' : projectName}.`);
    console.log(`\nRun 'project-object init${isGlobal ? ' --global' : ''}' to get started.`);
    return;
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(content);
  console.log(`${'─'.repeat(60)}\n`);
}

module.exports = { show };
