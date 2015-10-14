/**
 * Created by Michael on 2015/10/7.
 */
Patterns = {};

Patterns.NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length > 0;
});

SimpleSchema.RegEx.Mobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

Patterns.Mobile = Match.Where(_.partial(RegExCondition, SimpleSchema.RegEx.Mobile));

SimpleSchema.RegEx.VerificationCode = /^\d{6}$/;

Patterns.VerificationCode = Match.Where(_.partial(RegExCondition, SimpleSchema.RegEx.VerificationCode));

function RegExCondition(regEx, x) {
  check(x, String);
  return regEx.test(x);
}
