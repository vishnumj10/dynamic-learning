/* eslint-disable meteor/audit-argument-checks */
/* eslint-disable func-names */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const Classes = new Mongo.Collection('classes');

if (Meteor.isServer) {
  Meteor.publish('classes', () => Classes.find());
}

Meteor.methods({
  'classes.insert': function (classcode, name, instructor) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Classes.insert({
      classcode,
      name,
      instructor,
      roster: [],
    });
    Meteor.call('addClass', instructor, classcode);
  },

  'classes.addstudent': function (classcode, studentname) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Classes.update(
      { classcode },
      { $push: { roster: studentname } },
    );
    Meteor.call('addClass', studentname, classcode);
  },

  // 'classes.remove'() {
  //     return Classes.remove({});
  // }

});

export default Classes;
