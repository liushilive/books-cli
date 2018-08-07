const childProcess = require('child_process');
const crypto = require('crypto');
const os = require('os');

var binPath = "";
var isWin = /^win/.test(process.platform);
if (isWin) {
  childProcess.execFile('where', ['mmdc.cmd'], function (err, stdout, stderr) {
    if (err || stderr) {
      console.error("err=");
      console.error(err || stderr);
      reject(err || stderr);
    } else {
      binPath = stdout.split(/\r?\n/)[0];
    }
  });
} else {
  childProcess.execFile('which', ['mmdc'], function (err, stdout, stderr) {
    if (err || stderr) {
      console.error("err=");
      console.error(err || stderr);
      reject(err || stderr);
    } else {
      binPath = stdout.split(/\r?\n/)[0];
    }
  });
}

function string2svgAsync(mmdString) {
  const filename = 'foo' + crypto.randomBytes(4).readUInt32LE(0) + 'bar';
  const tmpFile = path.join(os.tmpdir(), filename);
  return new Promise((resolve, reject) => {
    fs.writeFile(tmpFile, mmdString, function (err) {
      if (err) {
        return console.error(err);
      }
      childProcess.execFile(binPath, ['-t', 'forest', '-i', tmpFile], function (err, stdout, stderr) {
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
          resolve("\n<!--mermaid-->\n<div>\n" + trim + "\n</div>\n<!--endmermaid-->\n\n");
        }
        console.debug(stdout);
      });
    });
  });
}

module.exports = { string2svgAsync };