const path = require("path");
const tools = require('./Tools');
const prism = require('./Prism');
const languages = require('lang-map').languages;

function process(page) {
  // var regex = /^(\s*)```mermaid((.*[\r\n]+)+?)?(\s*)```$/im;
  var regex = /^(\s*)@import\s*\"(.*)\"\s*({(.*)})*(\s*)$/im;
  // console.warn(page.content);
  var pageDir = path.dirname(page.rawPath);
  while ((match = regex.exec(page.content))) {
    var lang = "python";
    var rawBlock = match[0];
    var mermaidContent_1 = match[1];
    var mermaidContent_2 = match[2];
    // var mermaidContent_3 = match[3];
    var mermaidContent_4 = match[4];
    // var mermaidContent_5 = match[5];
    // console.warn(rawBlock);
    // console.warn(mermaidContent_1);
    // console.warn(mermaidContent_2);
    // console.warn(mermaidContent_3);
    // console.warn(mermaidContent_4);
    // console.warn(mermaidContent_5);
    lang = mermaidContent_4 || languages(/.+\.(.+)/.exec(mermaidContent_2)[1])[0];

    const absolutePath = path.resolve(pageDir, mermaidContent_2);
    var code = tools.readFileFromPath(absolutePath);

    code = code.replace(/(\r\n)|(\n)/g, mermaidContent_1);

    const processed = mermaidContent_1 + "```" + lang + "\n" +
      mermaidContent_1 + code +
      mermaidContent_1 + "```\n";

    console.debug(processed);

    page.content = page.content.replace(rawBlock, processed);
  }

  // var text = blk.body = tools.Rtrim(blk.body);
  // if (patt.test(text)) {
  //   ex = patt.exec(text);
  //   ex1 = ex[1];
  //   var lang = ex[3];
  //   console.debug(lang);
  //   if (!lang) {
  //     lang = languages(/.+\.(.+)/.exec(ex1)[1])[0];
  //   }
  //   console.debug(lang);
  //   text = prism.code_highlighted('c = a + 20', lang);
  //   // text.kwargs.language = lang;
  // }
  // // console.debug(blk);
  // // text = '<pre>' + '<code>' + text + '</code>' + '</pre>';
  // console.debug(text);

  return page;
}

module.exports = { process };