/**
 * Created by Michael on 2015/11/9.
 */
if (Meteor.isServer) {

  Meteor.publishComposite("events", function (city, selector, options) {
    check(city, Pattern.City);
    check(selector, Match.Optional(Object));
    check(options, Match.Optional(Match.ObjectIncluding({
      sort: Match.Optional(Object),
      limit: Match.Optional(Number)
    })));

    selector = selector || {};
    options = options || {};

    Meteor._ensure(options, "sort");

    // TODO: pick
    
    return {
      find: function () {
        var _selector = _.extend({"location.city": city, private: false, status: "已发布"}, selector);
        var _options = {};
        if (!_.isEmpty(options.sort)) _options.sort = options.sort;
        if (options.limit) _options.limit = options.limit;

        return Events.find(_selector, _options);
      },
      children: [
        {
          find: function (event) {
            return Groups.find(event.author.club.id);
          }
        }
      ]
    };
  });
}
