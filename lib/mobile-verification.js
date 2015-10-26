/**
 * Created by Michael on 2015/10/6.
 */
var TTL = 300; // in seconds
var COOLDOWN = 60; // in seconds
var EVPKDF_KEY_SIZE = 256 / 32;
var EVPKDF_ITERATIONS = 1000;

var ttlDuration = moment.duration(TTL, "s");

var ttlAsMinutes = Math.ceil(ttlDuration.asMinutes());

var ERR_WRONG_CODE = "wrongCode";
var ERR_NO_VERIFICATION = "noVerification";
var ERR_NOT_COOLED_DOWN = "notCooledDown";

var MESSAGES = {};
MESSAGES[ERR_WRONG_CODE] = "验证码错误";
MESSAGES[ERR_NO_VERIFICATION] = "请重新获取验证码";
MESSAGES[ERR_NOT_COOLED_DOWN] = "短信验证太频繁，需稍等片刻才能再次发送";

MobileVerifications = new Meteor.Collection("mobile-verifications");
MobileVerifications.attachSchema(new SimpleSchema({
  mobile: {
    type: String,
    regEx: SimpleSchema.RegEx.Mobile,
    index: true,
    unique: true
  },
  code: {
    type: String,
    regEx: SimpleSchema.RegEx.VerificationCode
  },
  codeHash: {
    type: Object
  },
  "codeHash.hash": {
    type: String,
    regEx: /^[a-z0-9]{64}$/
  },
  "codeHash.salt": {
    type: String,
    regEx: /^[a-z0-9]{32}$/
  },
  expiration: {
    type: Date
  },
  used: {
    type: Boolean,
    optional: true
  }
}));

function hash(code, salt) {
  var saltWords = (salt && CryptoJS.enc.Hex.parse(salt)) ||
    CryptoJS.lib.WordArray.random(128 / 8);

  var hash = CryptoJS.EvpKDF(code, saltWords, {keySize: EVPKDF_KEY_SIZE, iterations: EVPKDF_ITERATIONS});
  return {
    hash: hash.toString(),
    salt: saltWords.toString()
  };
}

function hasExpired(expiration) {
  return !moment(expiration).isAfter();
}

if (Meteor.isServer) {

  function generateCode() {
    return _.times(6, function () {
      return _.random(9);
    }).join("");
  }

/*
  var VerificationReaper = (function () {

    var tid;

    function schedule() {
      tid = null;
      var next = MobileVerifications.findOne({}, {sort: {issueTime: 1}});
      if (next) {
        tid = Meteor.setTimeout(function () {
          MobileVerifications.remove(next._id);
          schedule();
        }, Math.max(moment(next.issueTime).add(ttlDuration).diff(moment()), 0));
      }
    }

    return {
      react: function () {
        if (tid) Meteor.clearTimeout(tid);
        MobileVerifications.remove({issueTime: {$lte: moment().subtract(ttlDuration).toDate()}});

        schedule();
        return this;
      }
    };
  }().react());
*/

  Meteor.methods({
    sendVerificationMessage: function (mobile) {
      Meteor.sendVerificationMessage(mobile);
    }
  });

  Meteor.sendVerificationMessage = function (mobile) {

    check(mobile, Pattern.Mobile);

    var code = generateCode();

    MobileVerifications.upsert({mobile: mobile}, {
      $setOnInsert: {mobile: mobile},
      $set: {
        code: code,
        codeHash: hash(code),
        expiration: moment().add(ttlDuration).toDate(),
        used: false
      }
    });

    var messageFormat = _.template("验证码：<%= code %>。您正在觅得U上验证您的手机，验证码<%= minutes %>分钟内有效");

    SmSender.batchSend(mobile, messageFormat({code: code, minutes: ttlAsMinutes}));
  };

  Meteor.verifyMobile = function (mobile, code) {
    check(mobile, Pattern.Mobile);
    check(code, Pattern.VerificationCode);

    var verification = MobileVerifications.findOne({mobile: mobile});
    if (!verification || verification.used || hasExpired(verification.expiration)) return false;

    MobileVerifications.update(verification._id, {$set: {used: true}});

    return code === verification.code;
  };

  Meteor.publish("mobileVerification", function (mobile) {
    return MobileVerifications.find({mobile: mobile}, {fields: {code: 0}});
  });
}

if (Meteor.isClient) {
  var subscriptionHandle;
  var countdown = new ReactiveVar(0);

  function startCountdown() {
    countdown.set(COOLDOWN);

    var iid = Meteor.setInterval(function () {
      if (countdown.get() > 0) {
        countdown.set(countdown.get() - 1);
      } else {
        Meteor.clearInterval(iid);
      }
    }, 1000);
  }

  Meteor.requestVerificationMessage = function (mobile, callback) {

    if (countdown.get() > 0) throw new Error(MESSAGES[ERR_NOT_COOLED_DOWN]);

    check(mobile, Pattern.Mobile);

    if (subscriptionHandle) subscriptionHandle.stop();
    subscriptionHandle = Meteor.subscribe("mobileVerification", mobile);

    Meteor.call("sendVerificationMessage", mobile, function (error, result) {
      if (!error) startCountdown();
      callback && callback(error, result);
    });
  };

  // reactive
  Meteor.verificationAvailCountdown = function () {
    return countdown.get();
  };

  // reactive
  Meteor.verifyMobile = function (mobile, code) {
    var verification = MobileVerifications.findOne({mobile: mobile});
    if (!verification || verification.used || hasExpired(verification.expiration))
      return ERR_NO_VERIFICATION;

    if (hash(code, verification.codeHash.salt).hash !== verification.codeHash.hash)
      return ERR_WRONG_CODE;
  };
}

SimpleSchema.messages(MESSAGES);
