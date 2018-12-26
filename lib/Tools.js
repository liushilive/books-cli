/**
 * 工具类
 */
const cpr = require('cpr');
const path = require('path');
const fs = require('fs');

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

function readFileFromPath(path) {
    let content;
    try {
        content = fs.readFileSync(path, "utf8");
    } catch (err) {
        if (err.code === "ENOENT") {
            logger.warn("Error: file not found: " + path);
            return "Error: file not found: " + path;
        } else {
            throw err;
        }
    }
    return content;
}

/**
 * 去掉左右空格
 */
function Trim(text) {
    return text.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 去掉左空格
 */
function Ltrim(text) {
    return text.replace(/(^\s*)/g, "");
}

/**
 * 去掉右空格
 */
function Rtrim(text) {
    return text.replace(/(\s*$)/g, "");
}

function isEmpty(val) {
    switch (typeof (val)) {
        case 'string':
            return trim_v(val).length == 0 ? true : false;
        case 'number':
            return val == 0;
        case 'object':
            return val == null;
        case 'array':
            return val.length == 0;
        default:
            return true;
    }
}

function trim_v(text) {
    if (typeof (text) == "string") {
        return text.replace(/^\s*|\s*$/g, "");
    } else {
        return text;
    }
}

module.exports = {
    copy,
    copy_assets,
    Trim,
    Ltrim,
    Rtrim,
    isEmpty,
    readFileFromPath
};