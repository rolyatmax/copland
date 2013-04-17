var Copland = Copland || {};

/////// App

var App = (function($) {

	var $el = $('#app');

	var colors = "#A67C87 #3F5573 #6A8AA6 #DAB6B6 #F2E4E4 #656975 #745D71".split(" ");


	var BASE_URL = (function() {
		return window.location.origin + window.location.pathname;
	}());
	var USE_TINY_URL = false;
	var VERSION = "0.1";
	var tempo = 400; // in ms
	var PAD_WIDTH = 40;
	var timeout = null;

	/////// API
	return {

		$el: $el,
		colors: colors,
		VERSION: VERSION,

		init: function() {

			var that = this;

			/////// SETUP THE SPRITE
			var sprite_data1 = {
				1 : [0,3000],
				2 : [4000,3000],
				3 : [8000,3000],
				4 : [12000,3000],
				5 : [16000,3000],
				6 : [20000,3000],
				7 : [24000,3000],
				8 : [28000,3000],
				9 : [32000,3000]
			};

			var sprite_data2 = {
				1 : [35000, 8500],
				2 : [45000, 8500],
				3 : [54000, 8500],
				4 : [65000, 8500],
				5 : [75000, 8500],
				6 : [84000, 8500],
				7 : [95000, 8500],
				8 : [105000, 8500],
				9 : [114000, 8500]
			};

			var instrument_data = [
				{
					sprite_data: sprite_data1,
					columns: 8,
					urls: this.urls,
					rhythmic_value: 1,
					limit: false,
					evolve: true,
					colors: colors
				},
				{
					sprite_data: sprite_data2,
					columns: 8,
					urls: this.urls,
					rhythmic_value: 16,
					limit: true,
					evolve: true,
					colors: colors
				}
			];

			////// Instantiate Instruments & Render

			this.instruments = (function() {

				var instruments = [];

				for (var i = 0, len = instrument_data.length; i < len; i++) {
					var data = instrument_data[i];

					var options = {
						sprite_data: data.sprite_data,
						urls: data.urls,
						rhythmic_value: data.rhythmic_value,
						columns: data.columns,
						width: data.columns * PAD_WIDTH,
						limit: data.limit,
						evolve: data.evolve,
						colors: colors
					};

					instruments.push( new Copland.Instrument(options) );
				}
				return instruments;
			}());

			this.render();


			///// Events

			$(document).on('keydown', function(e) {
				if (e.which == 8) { // backspace
					e.preventDefault();

					that.stopLoop();
					_.each(that.instruments, function(instrument) {
						instrument.clearActive();
					});
				}

				if (e.which == 69) { // 'e'
					that.toggleEvolve();
				}

				if (e.which == 83) { // 's'
					that.clickSave.call(that);
				}

				if (e.which == 73) { // 'i'
					that.toggleInfo.call(that);
				}

				if (e.which != 13 && e.which != 32) return;
				that.toggleLoop();
			});

			$("#container").on('click', '.sounds_control', function(e) {
				that.clickSoundsControl.call(that, e);
			}).on('click', '.save_btn', function(){
				that.clickSave.call(that);
			}).on('click', '.evolve_btn', function(){
				that.toggleEvolve();
			});
			$('.saved_popup .close').on('click', function(){
				that.closeSavedPopup.call(that);
			});

		},

		toggleInfo: function() {
			$('#info').toggleClass('open');
			$('#main_view').toggleClass('inactive');
		},

		openInfo: function(e) {
			$('#info').addClass('open');
			$('#main_view').addClass('inactive');
		},

		closeInfo: function(e) {
			$('#info').removeClass('open');
			$('#main_view').removeClass('inactive');
		},

		closeSavedPopup: function() {
			$('.saved_popup').removeClass('show');
		},

		render: function() {
			_.each(this.instruments, function(instrument) {
				this.$el.append(instrument.$el);
			}, this);

			// Render Sounds Controller Button
			var div = $("<div>")
				.addClass("sounds_control")
				.css({ backgroundColor: this.instruments[0].color() });

			this.$el.append( div );

		},

		toggleLoop: function() {
			if (timeout) {
				this.stopLoop();
			} else {
				this.playLoop();
			}
		},

		playLoop: function() {

			var that = this;

			_.each(this.instruments, function(instrument) {
				instrument.toggleClickSilent();

				// Set up counter while we're at it
				instrument.currentCol = 0;
			});

			var beats = 0;

			step();

			function step() {

				if (beats % 8 === 0) {
					var index = beats % colors.length;
					$('.bottombar').css({ backgroundColor: colors[index] });
				}

				_.each(that.instruments, function(instrument) {
					if (beats % instrument.rhythmic_value === 0) {
						instrument.playCol(instrument.currentCol % instrument.columns);
						instrument.currentCol++;
					}
				});

				beats++;
				timeout = setTimeout(step, tempo);
			}

		},

		stopLoop: function() {
			_.each(this.instruments, function(instrument) {
				instrument.toggleClickSilent();
			});

			this.stopEvolve();

			clearTimeout(timeout);
			timeout = null;
		},

		clickSoundsControl: function(e, colorIndex) {

			var $control = e ? $(e.target) : $('.sounds_control');

			this.changeAllSounds(colorIndex);
			var color = this.instruments[0].color();

			$control.css({
				backgroundColor: color
			});
		},

		changeAllSounds: function(colorIndex) {
			_.each(this.instruments, function(instrument) {
				instrument.changeSound(colorIndex);
			});
		},

		toggleEvolve: function() {
			if (this.evolving) {
				this.stopEvolve();
			} else {
				this.startEvolve();
			}
		},

		startEvolve: function() {
			if (!this.evolving) {
				_.each(this.instruments, function(instrument) {
					if (instrument.evolve) { instrument.startEvolve(); }
				});
				this.evolving = true;
				$('.evolve_btn').addClass('evolving');
			}
		},

		stopEvolve: function() {
			if (this.evolving) {
				_.each(this.instruments, function(instrument) {
					if (instrument.timeouts.evolve) { instrument.stopEvolve(); }
				});
				this.evolving = false;
				$('.evolve_btn').removeClass('evolving');
			}
		},

		setURLs: function() {
			this.urls = [
				"audio/morning_sprite.mp3",
				"audio/morning_sprite2.mp3",
				"audio/morning_sprite4.mp3",
				"audio/morning_sprite5.mp3",
				"audio/morning_sprite7.mp3",
				"audio/morning_sprite9.mp3"
			];

			if (Copland.low_res) {
				this.urls = [
					"audio/lowest/morning_sprite_lowest.mp3",
					"audio/lowest/morning_sprite2_lowest.mp3",
					"audio/lowest/morning_sprite4_lowest.mp3",
					"audio/lowest/morning_sprite5_lowest.mp3"
				];
			}

			this.filesToLoad = this.urls.length * 2; // 2 instruments right now
			this.filesLoaded = 0;

		},



		//////////// Preload

		checkFileCount: function() {
			var that = this;
			var perc = ((this.filesLoaded / this.filesToLoad * 100) + 0.5) | 0;
			perc += "%";
			var index = this.filesLoaded % colors.length;
			$('#perc').text(perc);
			$('.bottombar').css({
				width: perc,
				backgroundColor: colors[index]
			});
			if (this.filesLoaded === this.filesToLoad) {
				$('.bottombar').addClass("loaded").on("webkitTransitionEnd", onTransitionEnd);

				function onTransitionEnd(e) {
					if (e.originalEvent.propertyName !== "bottom") return;
					that.startHerUp();
					$(this).off("transitionend");				
				}
			}
		},

		startHerUp: function() {
			$("#res_popup").fadeOut();
			App.playLoop();
		},


		//////////// SAVING AND LOADING


		clickSave: function() {
			var code = this.savePattern();
			var url = BASE_URL + "#load/" + code;

			$('.saved_popup').css({ opacity: 0.1 });

			if (!USE_TINY_URL) {
				showURL(url);
				return;
			}

			$.getJSON('http://json-tinyurl.appspot.com/?url=' + url + '&callback=?',
				function(data) {
					showURL(data.tinyurl);
				}
			);

			function showURL(url) {
				$('.saved_popup textarea').val( url )
					.parent().addClass('show')
					.css({ opacity: 1 });
			}

		},

		savePattern: function() {
			var pattern = this.encodePattern();
			pattern = JSON.stringify( pattern );
			return encodeURIComponent( Base64.toBase64( RawDeflate.deflate(Base64.utob(pattern)) ) );
		},

		loadPattern: function(encodedString) {
			var pattern = Base64.btou( RawDeflate.inflate(Base64.fromBase64(encodedString)) );
			pattern = JSON.parse( pattern );
			return this.setupPattern( pattern );
		},

		encodePattern: function() {
			var pattern = {};

			pattern.version = "0.1";
			pattern.resolution = this.resolution;

			pattern.instruments = [];
			_.each(this.instruments, function(instrument, i){
				pattern.instruments[i] = {};

				pattern.instruments[i].columns = instrument.columns;
				pattern.instruments[i].rows = instrument.rows;
				pattern.instruments[i].currentSoundIndex = instrument.currentSoundIndex;

				var bits = [];
				_.each(instrument.pads, function(pad) {
					bits.push(pad.active);
				});
				pattern.instruments[i].bits = bits;
			});
			return pattern;
		},

		setupPattern: function(pattern) {

			var that = this;

			if (pattern.version != this.VERSION) {
				throw "This pattern was saved under a different version than the current version";
			}

			var soundIndex = pattern.instruments[0].currentSoundIndex;
			this.clickSoundsControl(null, soundIndex);

			_.each(this.instruments, function(instrument, i) {

				if (instrument.rows != pattern.instruments[i].rows) {
					throw "Error: saved instrument doesn't have the right number of rows";
				}

				if (instrument.columns != pattern.instruments[i].columns) {
					throw "Error: saved instrument doesn't have the right number of columns";
				}

				var bits = pattern.instruments[i].bits;
				_.each(instrument.pads, function(pad, i) {
					if (bits[i]) {
						pad.onActive();
					} else {
						pad.offActive();
					}
				});
			});
		}

	};

})(jQuery);



