const Katex = require('./lib/Katex');
const Mermaid = require('./lib/Mermaid');
const PlantUML = require('./lib/PlantUML');
const Tools = require('./lib/Tools');
const Prism = require('./lib/Prism');
const ImageCaptions = require('./lib/ImageCaptions');
const sectionx = require('./lib/sectionx');
const file_imports = require('./lib/file_imports');
const page_footer_copyright = require('./lib/page_footer_copyright');
const search_plus = require('./lib/search_plus');
const anchor_navigation_ex = require('./lib/anchor_navigation_ex');

module.exports = {
    Katex,
    Mermaid,
    PlantUML,
    Tools,
    Prism,
    ImageCaptions,
    sectionx,
    file_imports,
    page_footer_copyright: page_footer_copyright.page_footer_copyright,
    search_plus,
    anchor_navigation_ex
};
