Meteor.methods({
  'bdShortUrl': function (url) {
    var bdShortUrlApi = 'http://dwz.cn/create.php';
    var options = {
      params: {
        url: url
      }
    };
    var res = HTTP.call("POST", bdShortUrlApi, options);
    if (res.statusCode === 200) {
      var content = JSON.parse(res.content);
      return content.status === 0 ? {surl: content.tinyurl} : {surl: ''};
    }
  }
})