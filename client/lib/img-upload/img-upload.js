/**
 * Created by Michael on 2015/10/24.
 */
Template.imgUpload.onCreated(function () {
  this.defaultSrc = this.data.defaultSrc;
  this.imgLoaded = new ReactiveVar(false);
  this.imgSrc = new ReactiveVar(this.data.src || this.data.defaultSrc);
  this.w = this.data.width;
  this.h = this.data.height || this.data.width;
});

Template.imgUpload.onRendered(function () {

  var template = this;
  var loaderHeightPercentage = template.h / template.w * 100 + "%";

  template.$(".loader").css("paddingBottom", loaderHeightPercentage);

  template.$(".img-upload").data("muuu.imgUpload", new ImgUpload(template));
});

Template.imgUpload.helpers({
  imgLoaded: function () {
    var template = Template.instance();
    return template.imgLoaded.get();
  },
  imgSrc: function () {
    var template = Template.instance();
    return template.imgSrc.get();
  },
  changeDisabled: function () {
    var template = Template.instance();
    return (template.imgLoaded.get() && {}) || "disabled";
  },
  editDisabled: function () {
    var template = Template.instance();
    return (template.imgLoaded.get() && editable(template.imgSrc.get()) && {}) || "disabled";
  }
});

Template.imgUpload.events({
  "load img": function (event, template) {

    var $target = $(event.currentTarget);

    $target.guillotine({width: template.w, height: template.h});
    $target.guillotine("fit");

    template.imgLoaded.set(true);
    template.$(".img-upload").trigger("load.muuu.imgUpload");
  },
  "change .img-upload-chooser input[type=file]": function (event, template) {
    var $target = $(event.currentTarget);

    var f = $target[0].files[0];
    var imageType = /^image\//;
    if (!imageType.test(f.type)) return;

    template.imgLoaded.set(false);
    template.$(".img-upload").trigger("unload.muuu.imgUpload");

    var $picture = template.$("img").guillotine("remove");

    var reader = new FileReader();
    reader.onload = function (e) {
      //$picture.attr("src", e.target.result);
      template.imgSrc.set(e.target.result);
    };
    reader.readAsDataURL(f);
  },
  "mousedown .img-upload-zoomin:enabled": function (event, template) {
    var $picture = template.$("img");
    continuous(function () {
      $picture.guillotine("zoomIn");
    }, template);
  },
  "mousedown .img-upload-zoomout:enabled": function (event, template) {
    var $picture = template.$("img");
    continuous(function () {
      $picture.guillotine("zoomOut");
    }, template);
  },
  "mouseup .img-upload-zoomin, mouseleave .img-upload-zoomin, touchend .img-upload-zoomin, touchcancel .img-upload-zoomin, mouseup .img-upload-zoomout, mouseleave .img-upload-zoomout, touchend .img-upload-zoomout, touchcancel .img-upload-zoomout": function (event, template) {
    stopContinuous(template);
  },
  "click .img-upload-rotate": function (event, template) {
    template.$("img").guillotine("rotateRight");
  }
});

function continuous(action, template) {
  var t = 300;

  (function doTimeout() {
    action();
    template.tid = Meteor.setTimeout(doTimeout, t);
    if (t > 50) t -= 50;
  }());
}

function stopContinuous(template) {
  if (template.tid) {
    Meteor.clearTimeout(template.tid);
    template.tid = undefined;
  }
}

function editable(url) {
  return url.indexOf("data:image/") === 0;
}

var ImgUpload = function (template) {

  var $picture = template.$("img");

  var canvas = $("<canvas />")
    .attr({
      width: template.w,
      height: template.h
    })
    .get(0);
  var canvasContext = canvas.getContext("2d");

  function clearCanvas() {
    canvasContext.save();

    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.restore();
  }

  this.crop = function () {
    if (template.imgLoaded.get() && editable(template.imgSrc.get())) {

      canvasContext.save();

      var cropData = $picture.guillotine("getData");

      var ax = cropData.x / cropData.scale;
      var ay = cropData.y / cropData.scale;
      var aw = cropData.w / cropData.scale;
      var ah = cropData.h / cropData.scale;
      var w = canvas.width;
      var h = canvas.height;

      var sx, sy, sw, sh, dw, dh;

      switch (cropData.angle) {
        case 0:
          sx = ax;
          sy = ay;
          sw = aw;
          sh = ah;
          dw = w;
          dh = h;
          break;
        case 90:
          canvasContext.translate(w, 0);
          canvasContext.rotate((Math.PI / 180) * 90);
          sx = ay;
          sy = $picture[0].naturalHeight - (ax + aw);
          sw = ah;
          sh = aw;
          dw = h;
          dh = w;
          break;
        case 180:
          canvasContext.translate(w, h);
          canvasContext.rotate((Math.PI / 180) * 180);
          sx = $picture[0].naturalWidth - (ax + aw);
          sy = $picture[0].naturalHeight - (ay + ah);
          sw = aw;
          sh = ah;
          dw = w;
          dh = h;
          break;
        case 270:
          canvasContext.translate(0, h);
          canvasContext.rotate((Math.PI / 180) * 270);
          sx = $picture[0].naturalWidth - (ay + ah);
          sy = ax;
          sw = ah;
          sh = aw;
          dw = h;
          dh = w;
          break;
      }

      canvasContext.drawImage($picture[0], sx, sy, sw, sh, 0, 0, dw, dh);

      var result = canvas.toDataURL();

      clearCanvas();
      canvasContext.restore();

      return result;
    } else {
      return null;
    }
  };
};

$.fn.imgUpload = function (options) {
  if (_.contains(["crop"], options)) {
    return $(this[0]).data("muuu.imgUpload")[options]();
  }
};
