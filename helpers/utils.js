const sanitizeFilename = require('sanitize-filename');

function convertToFilename(string, options = { replacement: '-', maxLength: 255 }) {
    let sanitizedString = sanitizeFilename(string);
  
    sanitizedString = sanitizedString.replace(/[\s]+/g, options.replacement);
  
    if (sanitizedString.length > options.maxLength) {
      sanitizedString = sanitizedString.slice(0, options.maxLength);
    }
  
    return sanitizedString;
}

module.exports = convertToFilename;