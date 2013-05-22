(function($) {
  var Image = function(w, h, left, top) {
    this.w = w;
    this.h = h;
    this.o_w = w;
    this.o_h = h;
    this.left = left || 0;
    this.top = top = top || 0;
    this.right = this.left + w;
    this.bottom = this.top + h
    this.crop = {
      w: 100,
      h: 100,
      area: "100x100",
      offset: {}
    }
    this.resize = function(zoom) {
      this.w = this.o_w / zoom.now;
      this.h = this.o_h / zoom.now;
      this.zoom = zoom.now
      this.left = (this.left - this.crop.w/2) * (zoom.previous/zoom.now) + this.crop.w/2;
      this.top = (this.top - this.crop.h/2) * (zoom.previous/zoom.now) + this.crop.h/2;
      this.right = this.left + this.w
      this.bottom = this.top + this.h
    }
    this.translate = function (position) {
      this.left = position.left;
      this.top = position.top;
      this.right = this.left + this.w;
      this.bottom = this.top + this.h;
    }
    this.update = function(zoom) {
      var scale = (1/zoom * 100).toFixed(2);
      var area = this.crop.w.toString() + "x" + this.crop.h.toString();
      var offset_x = -this.left;
      var offset_y = -this.top;
      var data = {
        scale: scale,
        crop: {
          w: this.crop.w,
          h: this.crop.h,
          x: offset_x,
          y: offset_y,
          area: area
        },
        offset: {
          x: - this.crop.w,
          y: - this.crop.h
        },
        imagemagick: "-resize " + scale + "% -crop " + area + "+" + offset_x + "+" +  offset_y,
        minimagick: {
          resize: String(scale) + "%",
          crop: area + "+" + String(offset_x) + "+" +  String(offset_y)
        }
      }
      return data;
    }
    this.set_crop = function (w, h) {
      this.crop.w = w;
      this.crop.h = h;
      this.crop.area = this.crop.w.toString() + 'x' + this.crop.w.toString();
    }
  }
  var Zoom = function(min, max) {
    this.min = min;
    this.max = max;
    this.now = min;
    this.previous = min;
  }

  $.fn.icon_crop = function( options ) {

    // Default settings
    var settings = $.extend({
      crop_size: 100,
      crop_width: null,
      crop_height: null,
      onCropped: function() {}
    }, options);

    crop_w = settings.crop_width || settings.crop_size;
    crop_h = settings.crop_height || settings.crop_size

    return this.each( function() {
      if (!$(this).is('img')) {
        return;
      }

      var $image = $(this);

      $image.load( function(e) {

        // Start with image center at center of crop zone
        var image = new Image(
          $image.width(),
          $image.height(),
          (crop_w - $image.width())/2,
          (crop_h - $image.height())/2
        );
        image.set_crop(crop_w, crop_h);

        var zoom = new Zoom (Math.max(1, image.crop.w/image.o_w, image.crop.h/image.o_h), Math.min(image.o_w/image.crop.w, image.o_h/image.crop.h))
        $image.wrap('<div id="icon-crop"><div id="crop-box" style="width:' + image.crop.w + 'px; height: ' + image.crop.h + 'px" ></div></div>');
        $image.css({'left': image.left, 'top': image.top, 'width': image.w, 'height': image.h });
        $('#icon-crop').css({'width' : image.w + 'px' });
        $('<div id="icon-crop-slider"></div>').appendTo('#icon-crop')
        $('#icon-crop-slider').slider({
          min: zoom.min * 100,
          max: zoom.max * 100,
          slide: function( event, ui ) {
            zoom.now = ui.value/100;
            image.resize(zoom);
            $image.css({'left': image.left, 'top': image.top, 'width': image.w, 'height': image.h });
            zoom.previous = zoom.now;
            data = image.update(zoom.now);
            settings.onCropped.call( this, data );
          }
        });
        $image.draggable({
          drag: function( event, ui) {
            image.translate(ui.position);
            data = image.update(zoom.now);
            settings.onCropped.call( this, data );
          }
        });
      });
    });
  }
}(jQuery));