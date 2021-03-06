/**
 * 页脚
 */
function page_footer_copyright(gitbook, page) {
    var _tag = '<span id="busuanzi_container_site_uv" style="display:none">本站访客数 <span id="busuanzi_value_site_uv"></span> 人次</span>';

    var _copy = '<span class="copyright">© ' + (new Date()).getFullYear() + '  ' + gitbook.book.config.get('author', 'author') + '. All rights reserved.</span>';

    var _content = '<span class="footer-modification">' + _tag + '</span>';

    var str = '<footer class="page-footer">' + _copy + _content + '</footer>';

    var _js = '<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>';
    page.content = page.content + str + _js;
    return page;
}

module.exports = { page_footer_copyright };