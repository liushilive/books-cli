var cheerio = require('cheerio');

/**
 * 处理toc相关，同时处理标题和id
 * @param $
 * @param option
 * @param page
 * @returns {Array} 返回处理好的tocs合集
 */
function handlerTocs($, page) {
    var tocs = [];
    var count = {
        h1: 0,
        h2: 0,
        h3: 0
    };
    var titleCountMap = {}; // 用来记录标题出现的次数
    var h1 = 0,
        h2 = 0,
        h3 = 0;
    $(':header').each(function (i, elem) {
        var header = $(elem);
        var id = addId(header, titleCountMap);

        if (id) {
            switch (elem.tagName) {
                case "h1":
                    handlerH1Toc(count, header, tocs);
                    break;
                case "h2":
                    handlerH2Toc(count, header, tocs);
                    break;
                case "h3":
                    handlerH3Toc(count, header, tocs);
                    break;
                default:
                    titleAddAnchor(header, id);
                    break;
            }
        }
    });
    // 不然标题重写就没有效果，如果在外面不调用这句话的话
    page.content = $.html();
    return tocs;
}

/**
 * 处理锚点
 * @param header
 * @param titleCountMap 用来记录标题出现的次数
 * @returns {string}
 */
function addId(header, titleCountMap) {
    var id = header.attr('id') || "anchor";
    var titleCount = titleCountMap[id] || 0;
    titleCountMap[id] = titleCount + 1;
    // console.log('id:', id, 'n:', titleCount, 'hashmap:', titleCountMap)
    if (titleCount) { //此标题已经存在  null/undefined/0/NaN/ 表达式时，统统被解释为false
        id = id + '_' + titleCount;
    }
    header.attr("id", id);
    return id;
}

/**
 * 标题增加锚点效果
 * @param header
 * @param id
 */
function titleAddAnchor(header, id) {
    header.prepend('<a name="' + id + '" class="anchor-navigation-ex-anchor" ' +
        'href="#' + id + '">' +
        '<i class="fa fa-link" aria-hidden="true"></i>' +
        '</a>');
}

/**
 * 处理h1
 * @param count 计数器
 * @param header
 * @param tocs 根节点
 */
function handlerH1Toc(count, header, tocs) {
    var title = header.text();
    var id = header.attr('id');
    var level = ' '; //层级

    count.h1 += 1;
    count.h2 = 0;
    count.h3 = 0;

    header.text(level + title); //重写标题

    titleAddAnchor(header, id);
    tocs.push({
        name: title,
        level: level,
        url: id,
        children: []
    });
}

/**
 * 处理h2
 * @param count 计数器
 * @param header
 */
function handlerH2Toc(count, header, tocs) {
    var title = header.text();
    var id = header.attr('id');
    var level = ''; //层级

    if (tocs.length <= 0) {
        titleAddAnchor(header, id);
        return;
    }

    var h1Index = tocs.length - 1;
    var h1Toc = tocs[h1Index];
    count.h2 += 1;
    count.h3 = 0;
    level = (count.h2 + '. ');
    header.text(level + title); //重写标题
    titleAddAnchor(header, id);
    h1Toc.children.push({
        name: title,
        level: level,
        url: id,
        children: []
    });
}

/**
 * 处理h3
 * @param count 计数器
 * @param header
 */
function handlerH3Toc(count, header, tocs) {
    var title = header.text();
    var id = header.attr('id');
    var level = ''; //层级

    if (tocs.length <= 0) {
        titleAddAnchor(header, id);
        return;
    }
    var h1Index = tocs.length - 1;
    var h1Toc = tocs[h1Index];
    var h2Tocs = h1Toc.children;
    if (h2Tocs.length <= 0) {
        titleAddAnchor(header, id);
        return;
    }
    var h2Toc = h1Toc.children[h2Tocs.length - 1];

    count.h3 += 1;
    level = (count.h2 + '.' + count.h3 + '. ');
    header.text(level + title); //重写标题
    titleAddAnchor(header, id);
    h2Toc.children.push({
        name: title,
        level: level,
        url: id,
        children: []
    });
}

/**
 * 处理浮动导航：拼接锚点导航html，并添加到html末尾，利用css 悬浮
 * @param option
 * @param tocs
 * @param page
 */
function handlerFloatNavbar($, tocs, page) {
    var html = "<div id='anchor-navigation-ex-navbar'><i class='fa fa-anchor'></i><ul>";
    for (var i = 0; i < tocs.length; i++) {
        var h1Toc = tocs[i];
        html += "<li><span class='title-icon fa fa-hand-o-right'></span><a href='#" + h1Toc.url + "'><b>" + h1Toc.level + "</b>" + h1Toc.name + "</a></li>";
        if (h1Toc.children.length > 0) {
            html += "<ul>";
            for (var j = 0; j < h1Toc.children.length; j++) {
                var h2Toc = h1Toc.children[j];
                html += "<li><span class='title-icon fa fa-hand-o-right'></span><a href='#" + h2Toc.url + "'><b>" + h2Toc.level + "</b>" + h2Toc.name + "</a></li>";
                if (h2Toc.children.length > 0) {
                    html += "<ul>";
                    for (var k = 0; k < h2Toc.children.length; k++) {
                        var h3Toc = h2Toc.children[k];
                        html += "<li><span class='title-icon fa fa-hand-o-right'></span><a href='#" + h3Toc.url + "'><b>" + h3Toc.level + "</b>" + h3Toc.name + "</a></li>";
                    }
                    html += "</ul>";
                }
            }
            html += "</ul>";
        }
    }

    html += "</ul></div><a href='#" + tocs[0].url + "' id='anchorNavigationExGoTop'><i class='fa fa-arrow-up'></i></a>";

    page.content = html + $.html();
}

function hooks_page(page) {
    var $ = cheerio.load(page.content);
    // 处理toc相关，同时处理标题和id
    var tocs = handlerTocs($, page);

    // 设置处理之后的内容
    if (tocs.length == 0) {
        page.content = $.html();
        return;
    }

    handlerFloatNavbar($, tocs, page);

    var $x = cheerio.load(page.content);
    page.content = $x.html();
    return page;
}

module.exports = {
    hooks_page
};