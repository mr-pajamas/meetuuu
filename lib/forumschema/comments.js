/**
 * Created by jianyanmin on 15/10/2.
 */
Comments = new Mongo.Collection("comments");
var schema = {};
schema.Comments = new SimpleSchema ({
    discussionId:{
        type: String,
    },
    userId:{
        type: String,
    },
    userName: {
        type: String,
        optional: true
    },
    comment: {
        type: String,
        label:"Comment"
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
});

Comments.attachSchema(schema.Comments);