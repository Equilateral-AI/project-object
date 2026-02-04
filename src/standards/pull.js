/**
 * Pull standards from upstream repositories
 *
 * Clones OpenCore and Community repos, extracts YAML files,
 * and places them in .standards/{opencore,community}/.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const STANDARDS_DIR = '.standards';

const REPOS = {
  opencore: {
    url: 'https://github.com/Equilateral-AI/EquilateralAgents-Open-Standards.git',
    sourceDir: 'yaml',
    targetDir: 'opencore',
    label: 'OpenCore'
  },
  community: {
    url: 'https://github.com/Equilateral-AI/EquilateralAgents-Community-Standards.git',
    sourceDir: 'patterns',
    targetDir: 'community',
    label: 'Community'
  }
};

const EXCLUDED_FILES = ['TEMPLATE.yaml', 'MANIFEST.yaml', 'SCHEMA.yaml', 'VERSION.yaml'];

/**
 * Recursively find all .yaml files in a directory
 */
function findYamlFilesRecursive(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findYamlFilesRecursive(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.yaml') && !EXCLUDED_FILES.includes(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Copy YAML files from source to target, preserving subdirectory structure
 */
function copyYamlFiles(sourceDir, targetDir) {
  const files = findYamlFilesRecursive(sourceDir);
  let count = 0;

  for (const filePath of files) {
    const relativePath = path.relative(sourceDir, filePath);
    const destPath = path.join(targetDir, relativePath);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(filePath, destPath);
    count++;
  }

  return count;
}

/**
 * Get the .standards/ path for a project
 */
function getStandardsPath(projectPath = process.cwd()) {
  return path.join(projectPath, STANDARDS_DIR);
}

/**
 * Ensure .standards/ directory exists
 */
function ensureStandardsDir(projectPath = process.cwd()) {
  const standardsPath = getStandardsPath(projectPath);
  if (!fs.existsSync(standardsPath)) {
    fs.mkdirSync(standardsPath, { recursive: true });
  }
  return standardsPath;
}

/**
 * Pull standards from upstream repos into .standards/
 */
async function pullStandards(projectPath = process.cwd(), options = {}) {
  const { force = false } = options;
  const standardsPath = ensureStandardsDir(projectPath);
  const results = {};

  // Check if git is available
  try {
    execSync('git --version', { stdio: 'pipe' });
  } catch (e) {
    throw new Error('git is required to pull standards. Install git and try again.');
  }

  for (const [key, repo] of Object.entries(REPOS)) {
    const targetDir = path.join(standardsPath, repo.targetDir);

    // Skip if already exists and not forcing
    if (fs.existsSync(targetDir) && !force) {
      results[key] = { skipped: true };
      continue;
    }

    // Remove existing if forcing
    if (fs.existsSync(targetDir) && force) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    // Clone to temp directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `po-${key}-`));

    try {
      execSync(`git clone --depth 1 "${repo.url}" "${tempDir}"`, {
        stdio: 'pipe',
        timeout: 60000
      });

      // Copy YAML files
      const sourceDir = path.join(tempDir, repo.sourceDir);
      if (!fs.existsSync(sourceDir)) {
        throw new Error(`Source directory '${repo.sourceDir}' not found in ${repo.label} repository`);
      }

      fs.mkdirSync(targetDir, { recursive: true });
      const count = copyYamlFiles(sourceDir, targetDir);
      results[key] = { count, skipped: false };
    } catch (err) {
      if (err.message.includes('git is required')) throw err;
      throw new Error(`Could not pull ${repo.label} standards: ${err.message}`);
    } finally {
      // Clean up temp directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        // Best effort cleanup
      }
    }
  }

  // Create local directory if it doesn't exist
  const localDir = path.join(standardsPath, 'local');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  return results;
}

module.exports = {
  pullStandards,
  getStandardsPath,
  ensureStandardsDir,
  REPOS,
  STANDARDS_DIR,
  EXCLUDED_FILES
};
