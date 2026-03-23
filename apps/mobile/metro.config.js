const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo so Metro picks up changes in packages/shared
config.watchFolders = [monorepoRoot];

// Resolve modules from the workspace root as well as the project root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Enable package exports resolution so Metro uses the correct platform-specific
// build from each package's "exports" field, avoiding ESM-only code that
// contains `import.meta` which is not supported outside of ES modules.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
