Meteor.startup(function() {
  if(!EventTag.findOne()) {
    var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
      'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
      'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
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

  },
  'event.save': function(id, eventInfo) {
    // 更新tags
    console.log(eventInfo);
    eventInfo.tags.forEach(function(tag) {
      EventTag.update({'_id': tag._id}, {$inc: {refers: 1}});
    });
    if (id) {
      // 后续更新
      Event.update({_id: id},{'$set': eventInfo});
      return {code: 0};
    } else {
      // 第一次保存
      var nid = Event.insert(eventInfo);
      return {code: 0, eventId: nid};
    }

  }
});