'use strict';
module.exports = {
  verbose: true,
  ignoreFiles: [
    // Per https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/web-ext_command_reference#--ignore-files_-i
    // 1. Any file ending in .xpi or .zip is ignored
    // 2. Any hidden file (one that starts with a dot) is ignored
    // 3. Any directory named node_modules is ignored
    'package.json',
    '*.md',
    'copy-polyfill.js',
    'ignore/**',
    'web-ext-artifacts/**'
  ]
};
