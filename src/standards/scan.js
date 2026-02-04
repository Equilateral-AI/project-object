/**
 * Scan .standards/ directory for YAML files and metadata
 *
 * Returns per-source breakdown with counts and rule totals.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { getStandardsPath, EXCLUDED_FILES } = require('./pull');

/**
 * Recursively find all .yaml files in a directory
 */
function findYamlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findYamlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.yaml') && !EXCLUDED_FILES.includes(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Parse a single YAML standard file and extract metadata
 */
function parseStandardFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = yaml.parse(content);

    if (!parsed) return null;

    const rulesCount = Array.isArray(parsed.rules) ? parsed.rules.length : 0;

    return {
      id: parsed.id || path.basename(filePath, '.yaml'),
      path: filePath,
      rulesCount,
      category: parsed.category || 'unknown',
      priority: parsed.priority || 30
    };
  } catch (e) {
    console.warn(`  Warning: Could not parse ${path.basename(filePath)}: ${e.message}`);
    return null;
  }
}

/**
 * Scan a single source directory for standards
 */
function scanSource(sourceDir) {
  const files = findYamlFiles(sourceDir);
  const standards = [];
  let totalRules = 0;

  for (const filePath of files) {
    const parsed = parseStandardFile(filePath);
    if (parsed) {
      standards.push(parsed);
      totalRules += parsed.rulesCount;
    }
  }

  return {
    count: standards.length,
    rules: totalRules,
    files: standards
  };
}

/**
 * Scan all standards sources and return breakdown
 */
function scanStandards(projectPath = process.cwd()) {
  const standardsPath = getStandardsPath(projectPath);

  if (!fs.existsSync(standardsPath)) {
    return null;
  }

  return {
    opencore: scanSource(path.join(standardsPath, 'opencore')),
    community: scanSource(path.join(standardsPath, 'community')),
    local: scanSource(path.join(standardsPath, 'local'))
  };
}

module.exports = { scanStandards, findYamlFiles, parseStandardFile, scanSource };
