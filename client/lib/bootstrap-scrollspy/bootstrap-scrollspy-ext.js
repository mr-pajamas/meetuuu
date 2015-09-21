/**
 * Created by Michael on 2015/9/18.
 */
Meteor.startup(function () {

  $.fn.scrollspy.Constructor.prototype.process = function () {
    var optionsOffset = (typeof this.options.offset === "function" ? this.options.offset() : this.options.offset);

    var scrollTop    = this.$scrollElement.scrollTop() + optionsOffset;
    var scrollHeight = this.getScrollHeight();
    var maxScroll    = optionsOffset + scrollHeight - this.$scrollElement.height();
    var offsets      = this.offsets;
    var targets      = this.targets;
    var activeTarget = this.activeTarget;
    var i;

    if (this.scrollHeight != scrollHeight) {
      this.refresh();
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null;
      return this.clear();
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i] &&
        scrollTop >= offsets[i] &&
        (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) &&
        this.activate(targets[i]);
    }
  };

  $.fn.scrollspy.Constructor.prototype.destroy = function () {
    this.clear();
    this.$scrollElement.off("scroll.bs.scrollspy");
    if ($.isWindow(this.$scrollElement[0])) {
      this.$body.removeData("bs.scrollspy");
    } else {
      this.$scrollElement.removeData("bs.scrollspy");
    }
  };
});
