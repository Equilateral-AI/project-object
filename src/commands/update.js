/**
 * Update standards from upstream repositories
 *
 * Deletes .standards/opencore/ and .standards/community/,
 * re-pulls from upstream, leaves .standards/local/ untouched.
 */

const fs = require('fs');
const path = require('path');
const { pullStandards, getStandardsPath } = require('../standards/pull');
const { scanStandards } = require('../standards/scan');

async function update(options = {}) {
  const projectPath = process.cwd();
  const standardsPath = getStandardsPath(projectPath);

  console.log(`\nProject/Object - Update Standards\n`);

  // Check if standards exist
  if (!fs.existsSync(standardsPath)) {
    console.log(`No standards found.`);
    console.log(`\nRun 'project-object init' to pull standards first.`);
    return;
  }

  // Get before counts
  const before = scanStandards(projectPath);

  if (before) {
    console.log(`  Before:`);
    console.log(`    OpenCore:   ${before.opencore.count} standards (${before.opencore.rules} rules)`);
    console.log(`    Community:  ${before.community.count} standards (${before.community.rules} rules)`);
    console.log(`    Local:      ${before.local.count} standards (${before.local.rules} rules)`);
    console.log('');
  }

  // Delete upstream directories
  const opencoreDir = path.join(standardsPath, 'opencore');
  const communityDir = path.join(standardsPath, 'community');

  if (fs.existsSync(opencoreDir)) {
    fs.rmSync(opencoreDir, { recursive: true, force: true });
  }
  if (fs.existsSync(communityDir)) {
    fs.rmSync(communityDir, { recursive: true, force: true });
  }

  // Re-pull from upstream
  console.log(`  Pulling latest standards...`);

  try {
    await pullStandards(projectPath, { force: true });
  } catch (err) {
    console.error(`\n  Error: ${err.message}`);
    console.log(`\n  Your local standards in .standards/local/ are untouched.`);
    return;
  }

  // Get after counts
  const after = scanStandards(projectPath);

  if (after) {
    console.log(`\n  After:`);
    console.log(`    OpenCore:   ${after.opencore.count} standards (${after.opencore.rules} rules)`);
    console.log(`    Community:  ${after.community.count} standards (${after.community.rules} rules)`);
    console.log(`    Local:      ${after.local.count} standards (${after.local.rules} rules)`);

    const totalBefore = before ? before.opencore.count + before.community.count + before.local.count : 0;
    const totalAfter = after.opencore.count + after.community.count + after.local.count;
    const totalRulesAfter = after.opencore.rules + after.community.rules + after.local.rules;

    console.log(`\n  ✓ Standards updated (${totalAfter} standards, ${totalRulesAfter} rules)`);

    if (totalAfter !== totalBefore) {
      console.log(`    Note: Count changed from ${totalBefore} to ${totalAfter}`);
    }
  }

  console.log('');
}

module.exports = { update };
