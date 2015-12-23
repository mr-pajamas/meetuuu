/**
 * Created by jianyanmin on 15/12/12.
 */
var coverPath;
Template.createAlbum.onCreated(function(){
  coverPath = new ReactiveVar("");


});

Template.createAlbum.helpers({
  coverPath: function(){
    return coverPath.get();
  }
});

Template.createAlbum.events({
  "change .img-upload-chooser": function(e, template) {


  }
});
