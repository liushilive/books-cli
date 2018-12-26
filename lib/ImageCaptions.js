/**
 * 图片处理
 */
var cheerio = require('cheerio');
var Q = require('q');

var onInit = function (gitbook) {
    var config = readConfig(gitbook);
    return readAllImages(gitbook)
        .then(function (images) {
            return preprocessImages(images);
        })
        .then(function (images) {
            persistImagesInConfig(gitbook, config, images);
        });
};

var onPage = function (gitbook, page) {
    var images = readImagesFromConfig(gitbook);
    var html = insertCaptions(images, page, page.content);
    page.content = html; // side effect!
    return page;
};

var readConfig = function (gitbook) {
    var config = gitbook.config.get('pluginsConfig.books', {});
    // 带有图像的变量集名称(稍后提供图像列表)
    config.variable_name = config.variable_name || '_pictures';
    return config;
};

var persistImagesInConfig = function (gitbook, config, images) {
    gitbook.config.set(['variables', config.variable_name], images); // side effect!
};

var readImagesFromConfig = function (gitbook) {
    var pluginConfig = readConfig(gitbook);
    return gitbook.config.get(['variables', pluginConfig.variable_name]);
};

function setImageCaption($, img, data) {
    var imageParent = img.parent();
    data.label = img.attr('title') || img.attr('alt'); // 所有页面变量已经插值
    var figure = '<figure id="fig' + data.key + '">' + '<a href="' + data.url + '" data-lightbox="' + data.key + '">' + $.html(img) + '</a>' + '<figcaption>' + "图：" + data.label + '</figcaption></figure>';
    if (imageParent[0].tagName === 'p') {
        // 图像只用一段文字来包装
        imageParent.replaceWith(figure);
    } else {
        // 图像由一个链接包装，然后这个链接由一个段落包装
        img.replaceWith(figure);
        imageParent.parent().replaceWith(imageParent);
    }
}

var insertCaptions = function (images, page, htmlContent) {
    var pageLevel = page.level;
    var $ = cheerio.load(htmlContent);
    // 从部分内容获取所有图像
    $('img').filter(function () {
        return shouldBeWrapped($(this));
    })
        .each(function (i) {
            var img = $(this);
            var key = pageLevel + '.' + (i + 1);
            var data = images.filter(function (item) {
                return item.key === key;
            })[0];
            if (data) {
                setImageCaption($, img, data);
            }
        });
    return $.html();
};

function shouldBeWrapped(img) {
    return img.parent().children().length === 1 &&
        (img.attr('title') || img.attr('alt'));
}

function preprocessImages(results) {
    var totalCounter = 1;
    return results.sort(function (a, b) {
        return a.order - b.order;
    })
        .reduce(function (acc, val) {
            return acc.concat(val.data);
        }, []) // 部分图片
        .map(function (image) {
            image.nro = totalCounter++;
            image.list_caption = "图：" + image.label;
            return image;
        });
}

var getPageHtmlContent = function (gitbook, page) {
    return gitbook.readFileAsString(page.path)
        .then(function (text) {
            return gitbook.renderBlock('markdown', text); // TODO: what about AsciiDoc? Detection based on file extension?
        });
};

var parseImageData = function (page, index, img) {
    var image = {
        alt: img.attr('alt'),
        url: img.attr('src')
    };
    if (img.attr('title')) {
        image.title = img.attr('title');
    }
    image.label = image.title || image.alt;
    image.key = page.level + '.' + (index + 1);

    // FIXME: is it gitbook or plugin responsibility?
    // SEE: https://github.com/todvora/gitbook-plugin-image-captions/issues/9
    var pageLink = page.ref.replace(/readme.md/gi, 'index.html').replace(/.md/, '.html');
    image.backlink = pageLink + '#fig' + image.key; // TODO
    return image;
};

var readAllImages = function (gitbook) {
    var promises = [];

    var pageIndex = 0;

    gitbook.summary.walk(function (page) {
        var currentPageIndex = pageIndex++;
        if (page.path) { // 检查是否有真正的链接
            promises.push(
                getPageHtmlContent(gitbook, page)
                    .then(function (pageContent) {
                        var $ = cheerio.load(pageContent);
                        var pageImages = $('img')
                            .filter(function () {
                                return shouldBeWrapped($(this));
                            })
                            .map(function (index) {
                                var img = $(this);
                                return parseImageData(page, index++, img);
                            }).get();
                        return {
                            data: pageImages.reduce(function (acc, val) {
                                return acc.concat(val);
                            }, []),
                            order: currentPageIndex
                        };
                    }));
        }
    });
    return Q.all(promises);
};

module.exports = {
    onInit,
    onPage
};