/**
 * Created by Michael on 2015/10/22.
 */
TraitUsages = new Meteor.Collection("trait-usages");

TraitUsages.attachSchema(new SimpleSchema({
  trait: {
    type: String,
    max: 10,
    denyUpdate: true,
    index: true,
    unique: true
  },
  userCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  groupCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  }
}));
