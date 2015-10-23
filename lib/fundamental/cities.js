/**
 * Created by Michael on 2015/10/6.
 */
CITIES = [
  "上海",
  "北京",
  "广州"
];

if (Meteor.isClient) {

  Meteor.startup(function () {
    Session.setDefaultPersistent("currentCity", CITIES[0]);
  });

  Template.registerHelper("cities", function () {
    return CITIES;
  });

  Meteor.city = function () {
    return Session.get("currentCity");
  };

  Meteor.setCity = function (city) {
    check(city, Match.Where(function (x) {
      check(x, Match.OneOf(String, Number));
      if (typeof x === "string") {
        return _.contains(CITIES, x);
      } else {
        return x >= 0 && x < CITIES.length;
      }
    }));

    if (typeof city === "number") city = CITIES[city];

    Session.setPersistent("currentCity", city);
  };

  Template.registerHelper("currentCity", function () {
    return Meteor.city();
  });
}
