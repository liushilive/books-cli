const cheerio = require('cheerio');

var id = 0;

function hooks_page(page) {
  var content = page.content,
    match = content.match(/<!--\s*sec[\s\S]+?ces\s*-->[\s\S]+?<!--\s*endsec\s*-->/g);

  if (match) {

    var error = [];

    match.forEach(function (item, i) {

      var header = item.match(/<!--\s*sec[\s\S]+?ces\s*-->/)[0],
        body = item.replace(/<!--\s*sec[\s\S]+?ces\s*-->/, '').replace(/<!--\s*endsec\s*-->/, '');

      if (/<!--\s*sec/.test(body)) //contain nested sections
        error.push([header, '嵌套的部分不受这个插件的支持。']);

      if (!header.match(/data-title\s*=\s*"[^"]+?"\s/)) //contain valid title
        error.push([header, '没有有效的标题。']);

      if (header.match(/data-show\s*=\s*.+?\s/))
        if (!item.match(/data-show\s*=\s*true\s/) && !item.match(/data-show\s*=\s*false\s/))
          error.push([header, '属性 "data-show" 被设置为无效的值。']);

      content = content.replace(/<!--\s*sec\s/g, '<sec ')
        .replace(/\sces\s*-->/g, '>')
        .replace(/<!--\s*endsec\s*-->/g, '</sec>');
    });

    if (error.length > 0) {
      error.forEach(function (item) {
        console.log('Error: ' + item[1] + ' 请修改以下部分的语法：');
        console.log(item[0] + '\n');
      });

      page.content = '<p class="alert alert-danger">TO AUTHOR: 在这个页面中存在一些语法错误，请检查构建日志以获得详细信息。</p>';

    } else {

      var $ = cheerio.load(content);
      $('sec').each(function () {
        var html = $(this).html();
        $(this).data('title').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        id++;

        $(this).html(
          '<div class="panel panel-default">' +
          '<div class="panel-heading">' +
          '<b>' + $(this).data('title') +
          '<a class="pull-right section atTitle btn btn-default" target="sectionx' + id + '">' +
          '<span class="fa" />' + '</a>' +
          '</b>' +
          '</div>' +
          '<div class="panel-collapse" id="sectionx' + id + '">' +
          '<div class="panel-body">' + html + '</div>' +
          '</div>' +
          '</div>');

        if ($(this).data('show') === true) {
          $('.panel-collapse').addClass('in');
          $(".fa").addClass('fa-angle-up');
        } else {
          $(".panel-collapse").addClass('collapse');
          $(".fa").addClass('fa-angle-down');
        }
      });
      page.content = $.html();
    }
  }
  return page;
}

module.exports = {
  hooks_page
};