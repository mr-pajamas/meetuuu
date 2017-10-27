/**
 * Created by Michael on 2015/10/6.
 */
/*
var ERROR_MSGS = {
  101: "无此用户",
  102: "密码错",
  103: "提交过快（提交速度超过流速限制）",
  104: "系统忙（因平台侧原因，暂时无法处理提交的短信）",
  105: "敏感短信（短信内容包含敏感词）",
  106: "消息长度错（>536或<=0）",
  107: "包含错误的手机号码",
  108: "手机号码个数错（群发>50000或<=0;单发>200或<=0）",
  109: "无发送额度（该用户可用短信数已使用完）",
  110: "不在发送时间内",
  111: "超出该账户当月发送额度限制",
  112: "无此产品，用户没有订购该产品",
  113: "extno格式错（非数字或者长度不对）",
  115: "自动审核驳回",
  116: "签名不合法，未带签名（用户必须带签名的前提下）",
  117: "IP地址认证错,请求调用的IP地址不是系统登记的IP地址",
  118: "用户没有相应的发送权限",
  119: "用户已过期"
};

SmSender = function (account, password) {
  var ENDPOINT = "http://222.73.117.158/msg/HttpBatchSendSM";

  check(account, String);
  check(password, String);

  this.batchSend = function (mobiles, message) {
    check(mobiles, Match.OneOf(String, [String]));
    check(message, String);

    if (Match.test(mobiles, [String])) {
      mobiles = mobiles.join();
    }

    var resultContent = HTTP.post(ENDPOINT, {
      params: {
        account: account,
        pswd: password,
        mobile: mobiles,
        msg: message,
        needstatus: false
      }
    }).content;

    var code = resultContent.split(/[,\n]/)[1];

    if (code != "0") throw new Error(ERROR_MSGS[code] || "短信发送失败，原因未知");
  }
};

var SM_ACCOUNT = "vipkkdz";
var SM_PASSWORD = "Tch123456";

smSender = new SmSender(SM_ACCOUNT, SM_PASSWORD);
*/

var ERR_MSGS = {
  "-1": "系统异常",
  "-101": "命令不被支持",
  "-102": "RegistryTransInfo删除信息失败",
  "-103": "RegistryInfo更新信息失败",
  "-104": "请求超过限制",
  "-111": "企业注册失败",
  "-117": "发送短信失败",
  "-118": "接收MO失败",
  "-119": "接收Report失败",
  "-120": "修改密码失败",
  "-122": "号码注销激活失败",
  "-123": "查询单价失败",
  "-124": "查询余额失败",
  "-125": "设置MO转发失败",
  "-126": "路由信息失败",
  "-127": "计费失败0余额",
  "-128": "计费失败余额不足",
  "-110": "号码注册激活失败",
  "-1100": "序列号错误,序列号不存在内存中,或尝试攻击的用户",
  "-1102": "序列号密码错误",
  "-1103": "序列号Key错误",
  "-1104": "路由失败，请联系系统管理员",
  "-1105": "注册号状态异常, 未用 1",
  "-1107": "注册号状态异常, 停用 3",
  "-1108": "注册号状态异常, 停止 5",
  "-113": "充值失败",
  "-1131": "充值卡无效",
  "-1132": "充值密码无效",
  "-1133": "充值卡绑定异常",
  "-1134": "充值状态无效",
  "-1135": "充值金额无效",
  "-190": "数据操作失败",
  "-1901": "数据库插入操作失败",
  "-1902": "数据库更新操作失败",
  "-1903": "数据库删除操作失败"
};

var CDKEY = "8SDK-EMY-6699-RDULT";
var PASSWORD = "501241";

SmSender = function () {

  var ENDPOINT = "http://hprpt2.eucp.b2m.cn:8080/sdkproxy";

  function parseResultContent(content) {
    return xml2js.parseStringSync(content, {explicitRoot: false, explicitArray: false});
  }

  function activate() {
    /*
    var resultContent = HTTP.post(ENDPOINT + "/regist.action", {
      params: {
        cdkey: CDKEY,
        password: PASSWORD
      }
    }).content;

    var resultData = parseResultContent(resultContent);

    if (resultData.error !== '0')
      throw new Error(resultData.message || ERR_MSGS[resultData.error]);
    */
  }

  return {
    init: _.once(activate),
    batchSend: function (mobiles, message) {
      check(mobiles, Match.OneOf(String, [String]));
      check(message, String);

      if (Match.test(mobiles, [String])) {
        mobiles = mobiles.join();
      }

      /*
      var resultContent = HTTP.post(ENDPOINT + "/sendsms.action", {
        params: {
          cdkey: CDKEY,
          password: PASSWORD,
          phone: mobiles,
          message: message
        }
      }).content;

      var resultData = parseResultContent(resultContent);

      if (resultData.error !== '0')
        throw new Error(resultData.message || ERR_MSGS[resultData.error]);
      */
      console.log(mobiles, message);
    }
  };
}();

Meteor.defer(SmSender.init);
