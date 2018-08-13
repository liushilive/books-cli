const path = require("path");
const tools = require('./Tools');
const languages = require('lang-map').languages;

function process(page) {
  var pageDir = path.dirname(page.rawPath);
  const regex = /^(\s*)@import\s*\"(.*)\"\s*({(.*)})*(\s*)$/;
  let pageDir = path.dirname(page.rawPath);

  // 按行分析处理
  let pages = page.content.split(/\n|\r\n/);
  let tag = true;
  for (const key in pages) {
    if (pages.hasOwnProperty(key)) {
      const line = pages[key];
      if (line.indexOf('```') != -1) {
        tag = !tag;
        continue;
      }
      if (tag && regex.test(line)) {
        let match = regex.exec(line);

        var lang = "python";
        var rawBlock = match[0];
        var mermaidContent_1 = match[1];
        var mermaidContent_2 = match[2];
        var mermaidContent_4 = match[4];
        lang = mermaidContent_4 || languages(/.+\.(.+)/.exec(mermaidContent_2)[1])[0];

        const absolutePath = path.resolve(pageDir, mermaidContent_2);
        var code = tools.readFileFromPath(absolutePath);

        code = code.replace(/(\r\n)|(\n)/g, mermaidContent_1);

        const processed = mermaidContent_1 + "```" + lang + "\n" +
          mermaidContent_1 + code +
          mermaidContent_1 + "```\n";
        page.content = page.content.replace(rawBlock, processed);
      }
    }
  }

  return page;
}

module.exports = { process };