const Katex = require("katex");

const cssNames = ['katex/dist/katex.min.css'];
const source = [path.dirname(require.resolve('katex/dist/katex.min.css'))];
const destination = 'katex/dist';
const shortcuts = {
  parsers: ["markdown", "asciidoc", "restructuredtext"],
  start: "$$",
  end: "$$"
};

function process(blk) {
  var tex = blk.body;
  var isInline = (tex[0] == "\n");
  var output = Katex.renderToString(tex, {
    displayMode: isInline
  });
  return output;
}

module.exports = { process, shortcuts, cssNames, source, destination };