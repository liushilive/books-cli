var Entities = require('html-entities').AllHtmlEntities;

var Html = new Entities();

// Map of Lunr ref to document
var documentsStore = {};

function hooks_page(gitbook, page) {
  if (gitbook.output.name !== 'website' || page.search === false) {
    return page;
  }

  gitbook.log.debug.ln('index page', page.path);

  var text = page.content;
  // Decode HTML
  text = Html.decode(text);
  // Strip HTML tags
  text = text.replace(/(<([^>]+)>)/ig, '');
  text = text.replace(/[\n ]+/g, ' ');
  var keywords = [];
  if (page.search) {
    keywords = page.search.keywords || [];
  }

  // Add to index
  var doc = {
    url: gitbook.output.toURL(page.path),
    title: page.title,
    summary: page.description,
    keywords: keywords.join(' '),
    body: text
  };

  documentsStore[doc.url] = doc;

  return page;
}

function hooks_finish(gitbook) {
  if (gitbook.output.name !== 'website') return;

  gitbook.log.debug.ln('write search index');
  return gitbook.output.writeFile('search_plus_index.json', JSON.stringify(documentsStore));
}

module.exports = { hooks_page, hooks_finish };