/**
 * Created by jym on 2015/11/9.
 */
/**
 * Created by jianyanmin on 15/10/2.
 */
MyCollection = new Mongo.Collection("myCollection");
var schema = {};
schema.MyCollection = new SimpleSchema ({
    discussionId:{
        type: String,
    },
    userId:{
        type: String,
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
    }
});

MyCollection.attachSchema(schema.MyCollection);
