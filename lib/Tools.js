const cpr = require('cpr');
const path = require('path');

/**
 * 复制文件或文件夹
 * @param {string} source
 * @param {string} destination
 */
function copy(source, destination) {
  cpr(source, destination, {
    deleteFirst: false, //Delete "to" before
    overwrite: true, //If the file exists, overwrite it
    confirm: true //After the copy, stat all the copied files to make sure they are there
  }, function (err, files) {
    //err - The error if any (err.list might be available with an array of errors for more detailed information)
    if (err) {
      throw console.error(err);
    }
    //files - List of files that we copied
  });
}

function copy_assets(assets, outputDirectory) {
  for (var k in assets) {
    copy(path.dirname(require.resolve(assets[k])), path.join(outputDirectory, k));
  }
}

module.exports = { copy, copy_assets };