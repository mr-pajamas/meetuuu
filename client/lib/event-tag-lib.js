GeventTag = (function() {
  var that = this,
      tags = {};

  var addTag = function(tag) {
    var id = tag.id || tag._id;
    if (!tags.hasOwnProperty(id)) {
      tags[id] = tag;
      return id;
    } else {
      console.log('id: ' + id + 'already exist.');
      return ;
    }
  };

  var delTag = function(id) {
    if (tags.hasOwnProperty(id)) {
      delete tags[id];
      return id;
    } else {
      console.log('id: ' + id + 'not found.');
    }
  };

  var getTagById = function(id) {
    return tags[id];
  };

  var getAllTags = function() {
    var t = [];
    for (var id in tags) {
      if (tags.hasOwnProperty(id)) {
        t.push(tags[id]);
      }
    }
    return t;
  };

  var clearTags = function() {
    tags = {};
  };

  // export api
  return {
    addTag: addTag,
    delTag: delTag,
    getTagById: getTagById,
    getAllTags: getAllTags,
    clearTags: clearTags
  };
}());