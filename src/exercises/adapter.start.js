const fs = {};

module.exports = fs;

function extractFileName(path) {
  return path.replace(/^.*[\\/]/, '');
}
