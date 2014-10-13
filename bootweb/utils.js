/*
// windows version
exports.isAbsolute = function(path) {
    var result = splitDeviceRe.exec(path),
    device = result[1] || '',
    isUnc = device && device.charAt(1) !== ':';
    // UNC paths are always absolute
    return !!result[2] || isUnc;
};
And:

// posix version
exports.isAbsolute = function(path) {
    return path.charAt(0) === '/';
};
  */

/**
 All OS version
 */
var path = require('path');
exports.isAbsolute = function(dest) {
  return dest === path.resolve(dest);
};