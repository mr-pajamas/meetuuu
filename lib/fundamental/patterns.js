/**
 * Created by Michael on 2015/10/7.
 */
Pattern = {};

Pattern.NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length > 0;
});

SimpleSchema.RegEx.Mobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

Pattern.Mobile = Match.Where(_.partial(RegExCondition, SimpleSchema.RegEx.Mobile));

SimpleSchema.RegEx.VerificationCode = /^\d{6}$/;

Pattern.VerificationCode = Match.Where(_.partial(RegExCondition, SimpleSchema.RegEx.VerificationCode));

Pattern.City = Match.Where(function (x) {
  return _.contains(CITIES, x);
});

function RegExCondition(regEx, x) {
  check(x, String);
  return regEx.test(x);
}
