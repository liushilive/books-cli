/**
 * plant uml 绘图处理
 */
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
var os = require('os');
var pumlPath = "";
var isWin = /^win/.test(process.platform);
if (isWin) {
    var pumlPath = path.join(__dirname, '../node_modules/.bin/puml.cmd');
} else {
    var pumlPath = path.join(__dirname, '../node_modules/.bin/puml');
}

function string2svgAsync(body) {
    const filename = 'puml' + crypto.randomBytes(4).readUInt32LE(0) + 'bar';
    const tmpFile = path.join(os.tmpdir(), filename);
    const config = `skinparam defaultFontSize 18
skinparam defaultFontName PingFang SC,Verdana,Helvetica Neue,Microsoft Yahei,Hiragino Sans GB,Microsoft Sans Serif,WenQuanYi Micro Hei,sans-serif`;
    return new Promise((resolve, reject) => {
        fs.writeFile(tmpFile, config + body, function (err) {
            if (err) {
                return console.error(err);
            }
            childProcess.execFile(pumlPath, ['generate', '-C', 'utf-8', '-s', '-o', tmpFile + '.svg', tmpFile], function (err, stdout, stderr) {
                if (err || stderr) {
                    console.error("err=");
                    console.error(err || stderr);
                    fs.unlinkSync(tmpFile);
                    reject(err || stderr);
                } else {
                    const text = fs.readFileSync(tmpFile + '.svg', 'utf8');
                    fs.unlinkSync(tmpFile);
                    fs.unlinkSync(tmpFile + '.svg');
                    var trim = text.trim();
                    resolve("\n<!--puml-->\n<div style='text-align: center;'>\n" + trim + "\n</div>\n<!--endpuml-->\n\n");
                }
                console.debug(stdout);
            });
        });
    });
}

function processPumlBlockList(page) {
    var mermaidRegex = /^(\s*)```puml((.*[\r\n]+)+?)?(\s*)```$/im;
    var match;

    while ((match = mermaidRegex.exec(page.content))) {
        var rawBlock = match[0];
        var mermaidContent_1 = match[1];
        var mermaidContent_2 = match[2];
        var mermaidContent_4 = match[4];
        const processed = mermaidContent_1 + "{% puml %}\n" + mermaidContent_2 + mermaidContent_4 + "{% endpuml %}";
        page.content = page.content.replace(rawBlock, processed);
    }
    return page;
}

module.exports = {
    string2svgAsync,
    processPumlBlockList
};