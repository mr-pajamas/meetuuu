/**
 * Created by jym on 2015/9/28.
 */

Discussion = new  Mongo.Collection("discussion");
var schema = {};
schema.Discussion =new SimpleSchema({
  subject: {
    type: String,
    label: " subject",
    max:200
  },
  content: {
    type: String,
    label:" content",
    min: 1
  },
  groupId:{
    type: String,
    optional:true
  },
  userId: {
    type: String,
  },
  userName: {
    type: String,
    optional: true
  },
  commentCount: {
    type: Number,
    optional: true
  },
  upVote: {
    type: [String],
    optional: true
  },
  upVoteCount: {
    type: Number,
    optional: true
  },
  collectionCount: {
     type: Number,
     optional: true
   },
  viewCount: {
    type: Number,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  },

  lastReplyAt: {
    type: Date,
    optional: true
  },
  lastReplyUser: {
    type: String,
    optional: true
  },
  lastReplyUserId: {
    type: String,
    optional: true
  },
  imgPath: {
    type: [String],
    optional: true
  },
  closeStatus: {
    type: Number,
    autoValue: function() {
      if(this.isInsert){
        return 0;
      }
      if(this.isUpsert){
        return {$setOnInsert: 0};
      }
    }

  },
  setTop: {
    type: Number,
    autoValue: function() {
      if (this.isInsert) {
        return 0;
      }
      if(this.isUpsert) {
        return {$setOnInsert: 0};
      }
      //} else if (this.isUpsert) {
      //  return {$setOnInsert: 0};
      //} else {
      //  this.unset();
      //}
    }
  }
});

Discussion.attachSchema(schema.Discussion);
