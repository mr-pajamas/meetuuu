Meteor.startup(function() {
  if(!EventTag.findOne()) {
    var states = ['测试', 'meetuuu', '社交', '国顺路'];
    states.forEach(function(name, index) {
      EventTag.insert({name: name, refers: name.length});
    });
  }
});


// methods
Meteor.methods({
  'queryByName': function(query, options) {
    options = options || {};
    // guard against client-side DOS: hard limit to 50
    if (options.limit) {
      options.limit = Math.min(50, Math.abs(options.limit));
    } else {
      options.limit = 50;
    }
    options.sort = {'refers': 1};

    var regex = new RegExp(query, 'i');
    return EventTag.find({name: {$regex:  regex}}, options).fetch();
  },
  'insertNewTag': function(tagName) {
    check(tagName, String);
    if (!EventTag.findOne({name: tagName})) {
      var tagId = EventTag.insert({name: tagName, refers: 1});
      return tagId;
    }
  }
});