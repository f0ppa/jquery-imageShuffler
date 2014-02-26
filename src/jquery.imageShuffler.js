/* ========================================================================
 * jQuery.imageShuffler.js
 * https://github.com/f0ppa/jquery-imageShuffler
 * ========================================================================
 * Copyright 2014 Christopher Forsberg.
 * Licensed under MIT
 * (https://github.com/f0ppa/jquery-imageShuffler/blob/master/LICENSE)
 * ======================================================================== 
 */

(function($, window, undefined) {
	
	'use strict';

	var ImageShuffler, old, $container, $intro, VERSION, items_count, 
		item_intro_text, item_source, count, data, random;

	VERSION = '0.1.0';

	function randomNumber() {
		return Math.floor( Math.random() * 41 ) - 20;
	}

	$.fn.rotateImage = function(degrees) {
		this.css({
			'-moz-transform'	:'rotate(' + degrees + 'deg)',
			'-webkit-transform'	:'rotate(' + degrees + 'deg)',
			'transform'			:'rotate(' + degrees + 'deg)'
		});

		return this;
	};

	$container = $('#container');

	/* SET IMAGE SOURCES FOR CUTE KITTENS HERE (or whatever ever pleases you :D)
	 * The dataset is an array of objects, each object with two properties (`intro` and `src`).
	 *
	 * Adding an image:
	 *  { 
	 		src: './images/image.jpg', // relative url like so, or absolute url (http://...)
			intro: 'Text..' // HTML can be used here atm, should be avoided however.
	 	}
	 */
	/*data = [
        { src: 'http://placekitten.com/800/600' },
        { src: 'http://placekitten.com/400/600' },
        { src: 'http://placekitten.com/900/800' },
        { src: 'http://placesheen.com/400/600' }
    ];

	items_count	= data.length;

	for (var i = 0; i < items_count; i++) {
		count = 0;						
		item_source = data[i].src;

		$('<img />').load(function() {
			var $image;

			$image = $(this);			

			resizeCenterImage($image);

			$container.append($image);

			++count;

			random = randomNumber();

			if (count < items_count) {
				$image.rotateImage(random);
			}

			if (count === items_count) {
				$container.show();
			}
		}).attr('src', item_source).addClass('imageShuffler-img');
	}
	*/


	// ImageShuffler PUBLIC CLASS DEFINITION
	// ===============================

	ImageShuffler = function (element, options) {
		this.init('imageshuffler', element, options);
	};

	ImageShuffler.prototype.ensureImages = function() {
		if (!$.isArray(this.options.images) &&
		    !this.$element.find('img').length) {
			return false;
		}

		return true;
	};

	ImageShuffler.prototype.init = function (type, element, options) {
		var triggers, _this;

		_this = this;

		this.$element    = $(element).addClass('imageShuffler');
		this.enabled     = true;
		this.type        = type;
		this.options     = this.getOptions(options);
		this.images 	 = ( this.options.images ? this.options.images : 
								( this.$element.find('img').length ? 
								this.$element.find('img') : [] ) );
		this.$nextButton = $(this.options.nextButton);

		function loadImages(images, callback) {
			var imageSet;
			function isImageSet(array) {
				if (array.length) {
					return $(array[0]).is('img');
				}
			}

			if (isImageSet(images)) {
				callback(images);
			} else {
				imageSet = [];
				$.each(images, function(key, props) {
					$('<img />').attr('src', props.src).load(function() {
						imageSet.push($(this));
						if (key === images.length - 1) {
							callback(imageSet);
						}					
					});
				});
			}

		}

		if (!this.ensureImages()) {
			throw new Error('Plugin cannot be called with zero images.');
		}

		loadImages(this.images, function(imageSet) {
			var $element, $nextButton, imageCount, totalImages;
			
			$element    = _this.$element;
			$nextButton = _this.$nextButton;
			totalImages = imageSet.length;

			imageCount = 0;

			$.each(imageSet, function(key, props) {
				var $image;

				$image = $(this);	

				_this.resizeImage($image);

				$element.append($image);

				++imageCount;
				random = randomNumber();

				if (imageCount < totalImages) {
					$image.rotateImage(random);
				}

				/*if (imageCount === totalImages) {
					$container.show();
				}*/
			});

			$element.delegate('img', 'mouseenter', function() {
				$nextButton.show();
			}).on('mouseleave', function() {
				$nextButton.hide();
			});

			$nextButton.on('click', function() {
				var $current, $newCurrent, random, currentPositions;

				$current    = $element.find('img:last');
				$newCurrent = $current.prev();

				random 			 = randomNumber();
				currentPositions = {
					marginTop:  $current.css('margin-top'),
					marginLeft: $current.css('margin-left')
				};
				
				$current.animate({
					'marginLeft': '250px',
					'marginTop':  '-385px'
				}, 250, function() {
					$(this)
						.insertBefore($element.find('img:first'))
					    .rotateImage(random)
					    .animate({
							'marginTop':  currentPositions.marginTop,
							'marginLeft': currentPositions.marginLeft
						}, 250, function() {
							// Rotate to 0 degress on the visible image
							// so that we set it "straight".
							$newCurrent.rotateImage(0);
					    });
				});
			});
		});

		// Prepend next-button to container element.
		this.$element.prepend(
			this.$nextButton.hide().css({
				position: 'absolute',
				left: '50%',
				top: '50%',
				marginLeft: '-16px',
				marginTop: '-16px'
			})
		);

		// Space separated event triggers of ...
		triggers = (this.options.trigger && this.options.trigger.split(' ')) || [];

		for (var i = triggers.length; i--;) {
			var trigger, eventIn, eventOut;

			trigger = triggers[i]

			if (trigger == 'click') {
				this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
			} else if (trigger != 'manual') { 
				// remove?
				eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
				eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

				this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
				this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
			}
		}

	/*	this.options.selector ?
		  (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
		  this.fixTitle()*/
	}


	// Resize and center the images
	ImageShuffler.prototype.resizeImage = function($image) {
		var $element, options, img, imgWidth, imgHeight, containerWidth,
			containerHeight, newWidth, newHeight, ratio,
			newRatio, newestWidth, newestHeight;

		img       = new Image();
		img.src   = $image.attr('src');
		imgWidth  = img.width;
		imgHeight = img.height;
		options   = this.getOptions();
		$element  = this.$element;
		
		containerWidth  = ( options.width ? options.width : $element.width() );
		containerHeight = ( options.height ? options.height : $element.height() );
		
		if (imgWidth > containerWidth) {
			newWidth  = containerWidth;
			ratio     = imgWidth / containerWidth;
			newHeight = imgHeight / ratio;

			if (newHeight > containerHeight) {
				newestHeight = containerHeight;
				newRatio     = newHeight / containerHeight;
				newestWidth  = newWidth / newRatio;

				img.width  = newestWidth;
				img.height = newestHeight;
			} else {
				img.width  = newWidth;
				img.height = newHeight;
			}
		} else if (imgHeight > containerHeight) {
			newHeight = containerHeight;
			ratio     = imgHeight / containerHeight;
			newWidth  = imgWidth / ratio;

			if (newWidth > containerWidth) {
				newestWidth  = containerWidth;
				newRatio     = newWidth / containerWidth;
				newestHeight = newHeight / newRatio;

				img.width  = newestWidth;
				img.height = newestHeight;
			} else {
				img.width  = newWidth;
				img.height = newHeight;
			}
		}

		$image.css({
			'width': 	   img.width,
			'height': 	   img.height,
			'margin-top':  - ( img.height / 2 ) - 10 + 'px',
			'margin-left': - ( img.width / 2 ) - 10 + 'px'	
		});
	};

	ImageShuffler.DEFAULTS = $.extend({}, {
		nextButton: '<a id="imageShuffler-next" class="imageShuffler-next"></a>'
	});

	ImageShuffler.prototype.getDefaults = function () {
		return ImageShuffler.DEFAULTS;
	};

	ImageShuffler.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefaults(), /*this.$element.data(), */options)

		return options;
	};

	// ImageShuffler PLUGIN DEFINITION
	// =========================

	// No conflict reference
	old = $.fn.imageShuffler;

	$.fn.imageShuffler = function (option) {
		$.extend({}, this.Constructor, ImageShuffler.DEFAULTS, option);

		window.imgs = new ImageShuffler(this, option);
	};

	// ImageShuffler NO CONFLICT
	// ===================

	$.fn.imageShuffler.noConflict = function () {
		$.fn.ImageShuffler = old;
		return this;
	};

})(jQuery, window);