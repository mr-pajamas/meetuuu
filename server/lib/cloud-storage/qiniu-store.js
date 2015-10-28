/**
 * Created by Michael on 2015/10/25.
 */
var qiniu = Meteor.npmRequire("qiniu");

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

  return getUrl(wrappedQiniuIo.put(uptoken(key), key, body, extra).key);
}

function getUrl(key) {
  return qiniu.rs.makeBaseUrl(BUCKET_DOMAIN, key);
}

function remove(key) {
  return wrappedQiniuRsClient.remove(BUCKET_NAME, key);
}

ObjectStore = function () {
  return {
    put: uploadBuf,
    /*
    putDataUri: function (key, dataUri) {
      var str = dataUri.replace(/^data:/, "");
      var mimeType = str.match(/^[^;]+/)[0];
      str = str.substring(mimeType.length);
      str = str.replace(/^.*?;base64,/, "");

      return uploadBuf(key, new Buffer(str, "base64"), mimeType);
    },
    */
    getUrl: getUrl,
    remove: remove
  }
}();
