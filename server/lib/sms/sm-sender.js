/**
 * Created by Michael on 2015/10/6.
 */
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
