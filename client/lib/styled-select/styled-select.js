/**
 * Created by Michael on 2015/9/17.
 */
Template.styledSelect.onRendered(function () {

  var $select = this.$("select.form-control");
  var $selectText = this.$(".select-face > .select-text");

  $select.change(function () {
    $selectText.text($select.find(":selected").text());
  }).change();

  $select[0]._uihooks = {
    insertElement: function(node, next) {
      $(node).insertBefore(next);
      $select.change();
    },
    moveElement: function (node, next) {
      $(node).insertBefore(next);
      $select.change();
    },
    removeElement: function(node) {
      if ($(node).remove().is(":selected")) {
        $select.val("");
      }
      $select.change();
    }
  };
});

/*
Template.registerHelper("toArray", function () {
  return _.reject(arguments, function (arg) {
    return arg instanceof Spacebars.kw;
  });
});
*/
