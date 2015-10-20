/**
 * Created by jym on 2015/10/8.
 */
Template.itemDiscussion.onRendered( function () {

})
Template.itemDiscussion.helpers({
  setTopCss: function () {
    if (this.setTop==1) {
      console.log(this.imgPath);
      return true;
    } else {
      return false;
    }
  },
  contentFormate: function () {
    if(this.content.indexOf('<img')>=0)
     {
       return  (this.content.substring(0, this.content.indexOf('<img'))).replace(/<[^>]+>/g,"").substring(0,150) ;
     }
     else
     {
       return this.content.replace(/<[^>]+>/g,"").substring(0,150) ;
     }
  }
});
