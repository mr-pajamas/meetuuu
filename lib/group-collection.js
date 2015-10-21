/**
 * Created by Michael on 2015/10/6.
 */
Groups = new Meteor.Collection("groups");

Groups.attachSchema(new SimpleSchema({
  // TODO: regEx needed
  path: {
    type: String,
    index: true,
    unique: true
  },
  name: {
    type: String,
    index: true,
    unique: true
  },
  founderId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true
  },
  foundedDate: {
    type: Date,
    denyUpdate: true
  },
  organizerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  homeCity: {
    type: String,
    allowedValues: CITIES
  },
  logoUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  memberCount: {
    type: Number,
    min: 1,
    defaultValue: 1
  },
  eventCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  }
  // TODO: traits
}));
