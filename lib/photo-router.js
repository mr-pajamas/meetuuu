/**
 * Created by jianyanmin on 15/12/12.
 */
FlowRouter.route('/groups/:groupPath/album/', {
  action: function (params, queryParams) {
    BlazeLayout.render("groupLayout", {main: "albumMain"})
  },
  name: 'photo'
});


FlowRouter.route('/groups/:groupPath/createAlbum/', {
  action: function (params, queryParams) {
    BlazeLayout.render("groupLayout", {main: "createAlbum"})
  },
  name: 'createAlbum'
});
