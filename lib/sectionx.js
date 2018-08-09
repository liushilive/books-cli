const cheerio = require('cheerio');

var id = 0;

function sectionx(content, title, show) {
  id++;
  var $ = cheerio.load(
    '<div class="panel panel-default">' +
    '<div class="panel-heading">' +
    '<b>' + title +
    '<a class="pull-right section atTitle btn btn-default" target="sectionx' + id + '">' +
    '<span class="fa" />' + '</a>' +
    '</b>' +
    '</div>' +
    '<div class="panel-collapse" id="sectionx' + id + '">' +
    '<div class="panel-body">' + content + '</div>' +
    '</div>' +
    '</div>'
  );
  if (show === false) {
    $(".panel-collapse").addClass('collapse');
    $(".fa").addClass('fa-angle-down');
  }
  else {
    $('.panel-collapse').addClass('in');
    $(".fa").addClass('fa-angle-up');
  }
  return $.html();
}

module.exports = { sectionx };