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
    this.original_w = w;
    this.original_h = h;
    this.resize = function(zoom, crop) {
      this.w = this.original_w / zoom.now;
      this.h = this.original_h / zoom.now;
      this.zoom = zoom.now
      this.left = (this.left - crop.w/2) * (zoom.previous/zoom.now) + crop.w/2;
      this.top = (this.top - crop.h/2) * (zoom.previous/zoom.now) + crop.h/2;
      this.right = this.left + this.w
      this.bottom = this.top + this.h
    }
    this.translate = function (position) {
      this.left = position.left;
      this.top = position.top;
      this.right = this.left + this.w
      this.bottom = this.top + this.h
    }
    this.update = function() {
      crop_width = crop.w;
      crop_height = crop.h;
      crop_area = crop.w.toString() + 'x' + crop.w.toString();
      scale = 1/zoom.now * 100;
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

    if (settings.crop_width && settings.crop_height) {
      var crop = {
        w: settings.crop_width,
        h: settings.crop_height
      }
    } else {
      var crop = {
        w: settings.crop_size,
        h: settings.crop_size
      }
    }

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
          (crop.w - $image.width())/2,
          (crop.h - $image.height())/2
        );

        var zoom = new Zoom (Math.max(1, crop.w/image.o_w, crop.h/image.o_h), Math.min(image.o_w/crop.w, image.o_h/crop.h))

        $image.wrap('<div id="icon-crop"><div id="crop-box" style="width:' + crop.w + 'px; height: ' + crop.h + 'px" ></div></div>');
        $image.css({'left': image.left, 'top': image.top, 'width': image.w, 'height': image.h });
        $('<div id="icon-crop-slider"></div>').appendTo('#icon-crop')
        $('#icon-crop-slider').slider({
          min: zoom.min * 100,
          max: zoom.max * 100,
          slide: function( event, ui ) {
            zoom.now = ui.value/100;
            image.resize(zoom, crop);
            $image.css({'left': image.left, 'top': image.top, 'width': image.w, 'height': image.h });
            zoom.previous = zoom.now;
            image.update;
            settings.onCropped.call( this, image );
          }
        });
        $image.draggable({
          drag: function( event, ui) {
            image.translate(ui.position);
            image.update;
            settings.onCropped.call( this, image );
          }
        });
      });
    });
  }
}(jQuery));