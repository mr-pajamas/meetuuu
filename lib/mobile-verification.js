/**
 * Created by Michael on 2015/10/6.
 */
if (Meteor.isServer) {
  var TTL = 300; // in seconds

  var VerificationCodes = new Meteor.Collection("mobile-verifications");
  VerificationCodes.attachSchema(new SimpleSchema({
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
    expiration: {
      type: Date
    }
  }));

  function generateCode() {
    return _.times(6, function () {
      return _.random(9);
    }).join("");
  }

  Meteor.methods({

  });

  Accounts.sendVerificationMessage = function (mobile) {

    var messageFormat = _.template("验证码：<%= code %>。您正在觅得U上验证您的手机，验证码<%= minutes %>分钟内有效");

    check(mobile, Patterns.Mobile);

    var code = generateCode();
    var expiration = moment().add(TTL, "s").toDate();
    var minutes = Math.ceil(TTL / 60);

    VerificationCodes.upsert({mobile: mobile}, {
      $setOnInsert: {mobile: mobile},
      $set: {
        code: code,
        expiration: expiration
      }
    });

    Meteor.defer(function () {
      VerificationCodes.remove({expiration: {$lt: new Date()}});
    });

    smSender.batchSend(mobile, messageFormat({code: code, minutes: minutes}));
  };
}

if (Meteor.isClient) {
  Accounts.verifyMobile = function () {

  };
}
