/**
 * Created by Michael on 2015/10/23.
 */
Schema = {};

Schema.Trait = new SimpleSchema({
  name: {
    type: String,
    max: 10,
    denyUpdate: true
  },
  labeler: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true
  },
  labeledAt: {
    type: Date,
    denyUpdate: true
  }
});
