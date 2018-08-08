var Prism = require('prismjs');
var languages = require('prismjs').languages;
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var mkdirp = require('mkdirp');

var DEFAULT_LANGUAGE = 'markup';
var MAP_LANGUAGES = {
  'py': 'python',
  'js': 'javascript',
  'rb': 'ruby',
  'cs': 'csharp',
  'sh': 'bash',
  'html': 'markup'
};

// Base languages syntaxes (as of prism@1.6.0), extended by other syntaxes.
// They need to be required before the others.
var PRELUDE = [
  'markup-templating', 'clike', 'javascript', 'markup', 'c', 'ruby', 'css',
  // The following depends on previous ones
  'java', 'php'
];
PRELUDE.map(requireSyntax);

/**
 * Load the syntax definition for a language id
 */
function requireSyntax(lang) {
  require('prismjs/components/prism-' + lang + '.js');
}

const cssNames = ['prismjs/themes/prism-okaidia.css'];
const assets = {
  'prismjs/themes': 'prismjs/themes/prism-okaidia.css'
};
function code_highlighted(body, lang) {
  var highlighted = '';
  lang = MAP_LANGUAGES[lang] || lang;
  // Try and find the language definition in components folder
  if (!languages[lang]) {
    try {
      requireSyntax(lang);
    } catch (e) {
      console.warn('未能加载 prism 语法: ' + lang);
      console.warn(e);
    }
  }
  if (!languages[lang]) lang = DEFAULT_LANGUAGE;

  // Check against html, prism "markup" works for this
  if (lang === 'html') {
    lang = 'markup';
  }

  try {
    // The process can fail (failed to parse)
    highlighted = Prism.highlight(body, languages[lang]);
  } catch (e) {
    console.warn('高亮代码失败:');
    console.warn(e);
    highlighted = body;
  }

  return highlighted;
}

function hooks_page(page) {
  var highlighted = false;
  var $ = cheerio.load(page.content);
  $('pre').each(function () {
    highlighted = true;
    const $this = $(this);
    $this.addClass('language-');
  });
  if (highlighted) {
    page.content = $.html();
  }
  return page;
}

module.exports = { cssNames, assets, code_highlighted, hooks_page }
