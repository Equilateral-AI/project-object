/**
 * Project/Object - Conceptual continuity for Claude Code
 *
 * Main entry point for programmatic usage.
 */

const { harvest } = require('./harvest');
const { inject } = require('./inject');
const { getProjectName, getContextPath, getConfig } = require('./config');
const storage = require('./storage/local');
const { pullStandards, getStandardsPath } = require('./standards/pull');
const { scanStandards } = require('./standards/scan');
const { injectStandards } = require('./standards/inject');

module.exports = {
  harvest,
  inject,
  storage,
  getProjectName,
  getContextPath,
  getConfig,
  pullStandards,
  getStandardsPath,
  scanStandards,
  injectStandards
};
