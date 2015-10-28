/**
 * Created by Michael on 2015/10/25.
 */
var qiniu = Meteor.npmRequire("qiniu");
var mime = Meteor.npmRequire("mime");

qiniu.conf.ACCESS_KEY = "ArTWIe1q_1iDUdMm2notK3vjhARjbcNa_8S1zrZ5";
qiniu.conf.SECRET_KEY = "N9fwW3xXTNvUCdBKQqtcYZsUmaDquwSK1xh9anFv";
var BUCKET_NAME = "meetuuu";
var BUCKET_DOMAIN = "7xns4u.com1.z0.glb.clouddn.com";

var client = new qiniu.rs.Client();

var wrappedQiniuIo = Async.wrap(qiniu.io, ["put"]);
var wrappedQiniuRsClient = Async.wrap(client, ["remove"]);

function uptoken(key) {
  var putPolicy = new qiniu.rs.PutPolicy(BUCKET_NAME + (key && ":" + key));
  //putPolicy.callbackUrl = callbackUrl;
  //putPolicy.callbackBody = callbackBody;
  //putPolicy.returnUrl = returnUrl;
  //putPolicy.returnBody = returnBody;
  //putPolicy.asyncOps = asyncOps;
  //putPolicy.expires = expires;

  return putPolicy.token();
}

function uploadBuf(key, body, mimeType) {
  var extra = new qiniu.io.PutExtra();
  //extra.params = params;
  extra.mimeType = mimeType;
  //extra.crc32 = crc32;
  //extra.checkCrc = checkCrc;

  return wrappedQiniuIo.put(uptoken(key), key, body, extra).key;
}

function getUrl(key) {
  return qiniu.rs.makeBaseUrl(BUCKET_DOMAIN, key);
}

function parseUrl(url) {

  //var dotIndex = key.lastIndexOf(".");
  //if (dotIndex >= 0) key = key.substring(0, dotIndex);

  return url.substring(url.lastIndexOf("/") + 1);
}

function remove(key) {
  return wrappedQiniuRsClient.remove(BUCKET_NAME, key);
}

ObjectStore = function () {
  return {
    _put: uploadBuf,
    /*
    putDataUri: function (key, dataUri) {
      var str = dataUri.replace(/^data:/, "");
      var mimeType = str.match(/^[^;]+/)[0];
      str = str.substring(mimeType.length);
      str = str.replace(/^.*?;base64,/, "");

      return uploadBuf(key, new Buffer(str, "base64"), mimeType);
    },
    */
    _getUrl: getUrl,
    _remove: remove,

    putDataUri: function (dataUri) {
      var str = dataUri.replace(/^data:/, "");
      var mimeType = str.match(/^[^;]+/)[0];
      str = str.substring(mimeType.length);
      str = str.replace(/^.*?;base64,/, "");

      var key = Random.id(24) + "." + mime.extension(mimeType);

      return getUrl(uploadBuf(key, new Buffer(str, "base64"), mimeType));
    },
    removeByUrl: function (url) {
      return remove(parseUrl(url));
    }
  }
}();
