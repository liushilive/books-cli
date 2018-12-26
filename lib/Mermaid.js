/**
 * mermaid 绘图处理
 */
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
var os = require('os');
var mmdcPath = "";
var isWin = /^win/.test(process.platform);
if (isWin) {
    var mmdcPath = path.join(__dirname, '../node_modules/.bin/mmdc.cmd');
} else {
    var mmdcPath = path.join(__dirname, '../node_modules/.bin/mmdc');
}

function string2svgAsync(body) {
    const filename = 'foo' + crypto.randomBytes(4).readUInt32LE(0) + 'bar';
    const tmpFile = path.join(os.tmpdir(), filename);

    return new Promise((resolve, reject) => {
        fs.writeFile(tmpFile, body, function (err) {
            if (err) {
                return console.error(err);
            }
            childProcess.execFile(mmdcPath, ['-t', 'forest', '-i', tmpFile], function (err, stdout, stderr) {
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
                    resolve("\n<!--mermaid-->\n<div style='text-align: center;'>\n" + trim + "\n</div>\n<!--endmermaid-->\n\n");
                }
                console.debug(stdout);
            });
        });
    });
}

function processMermaidBlockList(page) {
    var mermaidRegex = /^(\s*)```mermaid((.*[\r\n]+)+?)?(\s*)```$/im;
    var match;
    while ((match = mermaidRegex.exec(page.content))) {
        var rawBlock = match[0];
        var mermaidContent_1 = match[1];
        var mermaidContent_2 = match[2];
        var mermaidContent_4 = match[4];
        const processed = mermaidContent_1 + "{% mermaid %}\n" + mermaidContent_2 + mermaidContent_4 + "{% endmermaid %}";
        page.content = page.content.replace(rawBlock, processed);
    }
    return page;
}
module.exports = {
    string2svgAsync,
    processMermaidBlockList
};