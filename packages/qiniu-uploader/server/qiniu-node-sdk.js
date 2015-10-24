// 引入七牛 node.js SDK
QiniuNodeSDK = Npm.require('qiniu');

// 创建上传策略：服务端上传
/* ==================++++填写下面三个参数++++=================*/
var ak = 'Jk8H0GPyE1MjCF_wS6pcLOZv4WwlWuqX3Um6Z2ob';//'ACCESS KEY';
var sk = 'jZ-78MDNf36HD85TusqFNuyz0eT-Kxlrh_GfPB2M';//'SECRET KEY';
var bucketname = 'for-test';//'BUCKET NAME';

//var qiniuKeys = Assets.getText('qiniu-keys.json');
//console.log(qiniuKeys);

QiniuNodeSDK.conf.SECRET_KEY = sk;
QiniuNodeSDK.conf.ACCESS_KEY = ak;
var putPolicy = new QiniuNodeSDK.rs.PutPolicy(bucketname);

// 转换异步接口为同步

var qiniuClient = new QiniuNodeSDK.rs.Client();
var wrappedQiniuIo = Async.wrap(QiniuNodeSDK.io, ['put']);
var wrappedQiniuClient = Async.wrap(qiniuClient, ['stat', 'remove', 'copy', 'move']); //获取基本信息，移动...

// 上传二进制头像文件
function uploadImgBuf(avatarBuf) {
  var uptoken = putPolicy.token();
  var extra = new QiniuNodeSDK.io.PutExtra();
  extra.mimeType = 'image/jpeg';
  return wrappedQiniuIo.put(uptoken, '', avatarBuf, extra);
}

// 上传html字符串
function uploadHtmlBuf(htmlStr) {
  var uptoken = putPolicy.token();
  var extra = new QiniuNodeSDK.io.PutExtra();
  extra.mimeType = 'text/html';
  return wrappedQiniuIo.put(uptoken, '', htmlStr, extra);
}




Meteor.methods({
  // 接收头像信息，base64 格式
  'sendAvatarInBase64': function(avatarBuf) {
    check(avatarBuf, String);
    if (!this.userId) {
      return {
        code: -1,
        msg: '非登录用户，无法上传头像'
      }
    }

    var res = uploadImgBuf(new Buffer(avatarBuf.replace(/^data:image\/\w+;base64,/, ""), 'base64'));
    if (res.key) {
      //当前线上头像
      var currentKey = Meteor.user().avatar;
      // 更新头像
      var updateRes = Meteor.users.update({'_id': this.userId}, {'$set': {'avatar': res.key}});
      if (updateRes === 1) {
        if (currentKey) {
          // 更新成功，删除当前的头像
          wrappedQiniuClient.remove(bucketname, currentKey);
        }
        return {
          code: 0,
          msg: '图片上传成功'
        }
      }
    }

    return {
      code: -1,
      msg: '图片上传失败，请重试'
    }
  },
  // 接收海报信息，base64 格式
  'sendPosterInBase64': function(oldKey, posterBuf) {
    check(posterBuf, String);
    if (!this.userId) {
      return {
        code: -1,
        msg: '非登录用户，无法上传头像'
      }
    }
    // TODO 判别权限
    console.log(posterBuf);
    console.log(oldKey);
    var res = uploadImgBuf(new Buffer(posterBuf.replace(/^data:image\/\w+;base64,/, ""), 'base64'));
    if (res.key) {
      if (oldKey) {
        wrappedQiniuClient.remove(bucketname, oldKey);
      }
      return {
        code: 0,
        key: res.key
      };
    }

    return {
      code: -1
    };
  },
  // 接收富文本编辑信息，base64 格式
  'sendRichTextInBase64': function(oldKey, htmlBuf) {
    check(htmlBuf, String);
    if (!this.userId) {
      return {
        code: -1,
        msg: '非登录用户，无法上传头像'
      }
    }
    // TODO 判别权限
    var res = uploadHtmlBuf(htmlBuf);
    if (res.key) {
      if (oldKey) {
        wrappedQiniuClient.remove(bucketname, oldKey);
      }
      return {
        code: 0,
        key: res.key
      };
    }

    return {
      code: -1
    };
  }
});
