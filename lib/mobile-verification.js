/**
 * Created by Michael on 2015/10/6.
 */
var TTL = 300; // in seconds
var COOLDOWN = 60; // in seconds
var EVPKDF_KEY_SIZE = 256 / 32;
var EVPKDF_ITERATIONS = 1000;

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
    regEx: /\d{6}/
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
  issueTime: {
    type: Date
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

if (Meteor.isServer) {

  function generateCode() {
    return _.times(6, function () {
      return _.random(9);
    }).join("");
  }

  var VerificationReaper = (function () {

    var tid = null;

    function schedule() {
      var next = MobileVerifications.findOne({}, {sort: {expiration: 1}});
      if (next) {
        tid = Meteor.setTimeout(function () {
          MobileVerifications.remove(next._id);
          tid = null;
          schedule();
        }, Math.max(moment(next.expiration).diff(moment()), 0));
      }
    }

    return {
      react: function () {
        if (tid) Meteor.clearTimeout(tid);
        MobileVerifications.remove({expiration: {$lte: new Date()}});

        schedule();
        return this;
      }
    };
  }().react());

  Meteor.methods({

  });

  Meteor.sendVerificationMessage = function (mobile) {

    var messageFormat = _.template("验证码：<%= code %>。您正在觅得U上验证您的手机，验证码<%= minutes %>分钟内有效");

    check(mobile, Patterns.Mobile);

    var code = generateCode();
    var duration = moment.duration(TTL, "s");
    var expiration = moment().add(duration).toDate();
    var minutes = Math.ceil(duration.asMinutes());

    MobileVerifications.upsert({mobile: mobile}, {
      $setOnInsert: {mobile: mobile},
      $set: {
        code: code,
        expiration: expiration,
        codeHash: hash(code),
        valid: true
      }
    });

    VerificationReaper.react();

    //smSender.batchSend(mobile, messageFormat({code: code, minutes: minutes}));
  };

  Meteor.publish("mobileVerification", function (mobile) {
    return MobileVerifications.find({mobile: mobile}, {fields: {code: 0}});
  });
}

if (Meteor.isClient) {

  // reactive
  Meteor.verifyMobile = function (code) {
    var mobileVerification = MobileVerifications.findOne();
    if (mobileVerification) {
      return hash(code, mobileVerification.codeHash.salt) !== mobileVerification.codeHash.hash;
    } else {
      throw new Error("请重新获取验证码");
    }
  };
}
