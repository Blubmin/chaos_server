var path = require('path');
var fs = require('fs');

var rootPath;
var found = false;
var pathArr = getPathArr();
var arraySlice = Array.prototype.slice;

// find package.json from the inside out
while (pathArr.length > 0) {
  rootPath = pathArr.join(path.sep);
  if (fs.existsSync(path.join(rootPath, 'package.json'))) {
    found = true;
    break;
  }
  pathArr.pop();
}

if (!found) {
  throw new Error('cannot find any package.json file');
}

module.exports = function () {
  switch (arguments.length) {
    case 1:
      return path.join(rootPath, arguments[0]);
    case 0:
      return rootPath;
    default:
      var arg = arraySlice.call(arguments);
      arg.unshift(rootPath);
      return path.join.apply(this, arg);
  }
};

function getPathArr () {
  var dirname = __dirname;
  // make sure the path is outside node_modules directory
  var index = dirname.indexOf(path.sep + 'node_modules' + path.sep);
  if (index !== -1) {
    dirname = dirname.slice(0, index);
  }
  return dirname.split(path.sep);
}
