(function($) {
  var Box = function(w, h) {
    this.w = w;
    this.h = h;
    this.original_w = w;
    this.original_h = h;
    this.zoom = function(zoom) {
      this.w = this.original_w / zoom.now;
      this.h = this.original_h / zoom.now;
    }
  }
  var Offset = function(x, y) {
    this.x = x;
    this.y = y;
    this.original_x = x;
    this.original_y = y;
    this.translate = function(position) {
      this.x = position.left;
      this.y = position.top;
    }
    this.zoom = function(crop, zoom) {
      this.x = (this.x - crop.w/2) * (zoom.previous/zoom.now) + crop.w/2;
      this.y = (this.y - crop.h/2) * (zoom.previous/zoom.now) + crop.h/2;
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

    return this.each( function() {
      if (!$(this).is('img')) {
        return;
      }

      var $image = $(this);

      $image.load( function(e) {
        var image_size = new Box($image.width(), $image.height());

        if (settings.crop_width && settings.crop_height) {
          var crop = new Box(settings.crop_width, settings.crop_height);
        } else {
          var crop = new Box(settings.crop_size, settings.crop_size);
        }

        // Start with image center at center of crop zone
        var lefttop = new Offset((crop.w - image_size.original_w)/2, (crop.h - image_size.original_h)/2);
        var zoom = new Zoom (Math.max(1, crop.w/image_size.original_w, crop.h/image_size.original_h), Math.min(image_size.original_w/crop.w, image_size.original_h/crop.h))

        $image.wrap('<div id="icon-crop"><div id="crop-box" style="width:' + crop.w + 'px; height: ' + crop.h + 'px" ></div></div>');
        $image.css({'left': lefttop.x, 'top': lefttop.y, 'width': image_size.w, 'height': image_size.h });
        $('<div id="icon-crop-slider"></div>').appendTo('#icon-crop')
        $('#icon-crop-slider').slider({
          min: zoom.min * 100,
          max: zoom.max * 100,
          slide: function( event, ui ) {
            zoom.now = ui.value/100;
            image_size.zoom(zoom);
            lefttop.zoom(crop, zoom);
            $image.css({'left': lefttop.x, 'top': lefttop.y, 'width': image_size.w, 'height': image_size.h });
            zoom.previous = zoom.now;
            updateCropData();
          }
        });
        $image.draggable({
          drag: function( event, ui) {
            lefttop.x = ui.position.left;
            lefttop.y = ui.position.top;
            updateCropData();
          }
        });
        function updateCropData() {
          if ( $.isFunction(settings.onCropped) ) {
            crop_params = {
              w: crop.w,
              h: crop.h,
              area: crop.w.toString() + 'x' + crop.w.toString(),
              x: -lefttop.x,
              y: -lefttop.y,
              scale: 1/zoom.now * 100
            }

            settings.onCropped.call( this, crop_params );
          }
        }
      });
    });
  }
}(jQuery));