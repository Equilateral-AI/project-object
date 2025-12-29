/**
 * Show status of Project/Object context
 */

const { getProjectName, getContextFilePath, STORAGE_DIR } = require('../config');
const storage = require('../storage/local');

async function status(options = {}) {
  const { global: isGlobal } = options;
  const projectName = isGlobal ? 'global' : getProjectName(process.cwd());

  console.log(`\nProject/Object Status\n`);
  console.log(`─────────────────────────────────────────`);

  if (isGlobal) {
    console.log(`Scope: Global`);
  } else {
    console.log(`Project: ${projectName}`);
  }

  const stats = storage.getContextStats(projectName, isGlobal);

  if (!stats) {
    console.log(`\nNo context found.`);
    console.log(`\nRun 'project-object init${isGlobal ? ' --global' : ''}' to get started.`);
    return;
  }

  console.log(`\nContext File: ${stats.path}`);
  console.log(`Size: ${formatBytes(stats.size)}`);
  console.log(`Lines: ${stats.lines}`);
  console.log(`Last Modified: ${stats.modified.toLocaleString()}`);

  console.log(`\nSections:`);
  console.log(`  Decisions:   ${stats.sections.decisions}`);
  console.log(`  Patterns:    ${stats.sections.patterns}`);
  console.log(`  Corrections: ${stats.sections.corrections}`);
  console.log(`  Notes:       ${stats.sections.notes}`);

  const total = Object.values(stats.sections).reduce((a, b) => a + b, 0);
  console.log(`  ─────────────`);
  console.log(`  Total:       ${total} items`);

  // Show other projects if checking project-level
  if (!isGlobal) {
    const projects = storage.listProjects();
    const otherProjects = projects.filter(p => p !== projectName && p !== 'global');

    if (otherProjects.length > 0) {
      console.log(`\nOther projects with context:`);
      otherProjects.forEach(p => console.log(`  - ${p}`));
    }

    // Check for global context
    const globalStats = storage.getContextStats(null, true);
    if (globalStats) {
      const globalTotal = Object.values(globalStats.sections).reduce((a, b) => a + b, 0);
      console.log(`\nGlobal context: ${globalTotal} items`);
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`\nCommands:`);
  console.log(`  project-object show   # View full context`);
  console.log(`  project-object edit   # Edit context`);
  console.log(`  project-object clear  # Reset context`);
  console.log('');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

module.exports = { status };
