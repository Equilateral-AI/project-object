/**
 * Project/Object - Conceptual continuity for Claude Code
 *
 * Main entry point for programmatic usage.
 */

const { harvest } = require('./harvest');
const { inject } = require('./inject');
const { getProjectName, getContextPath, getConfig } = require('./config');
const storage = require('./storage/local');

module.exports = {
  harvest,
  inject,
  storage,
  getProjectName,
  getContextPath,
  getConfig
};
