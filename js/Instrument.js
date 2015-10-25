var Copland = Copland || {};

(function($) {
    'use strict';

    /////// Instrument

    Copland.Instrument = function(options) {

        var that = this;

        //// Setup Defaults

        var defaults = {
            columns: 8,
            timeouts: {},
            rhythmicValue: 1,
            limit: false,
            currentSoundIndex: 0,
            evolve: false
        };

        options = this.options = _.defaults(options, defaults);

        _.extend(this, options);

        this.width = this.width + 'px';
        this.$el = $('<div>').addClass('instrument');
        this.pads = [];

        this.sounds = (function() {
            var sounds = [];
            for (var i = 0, len = that.urls.length; i < len; i++) {
                var sound = new Howl({
                    urls: [ that.urls[i] ],
                    sprite: _.clone(that.spriteData),
                    onload: function() {
                        App.filesLoaded++;
                        App.checkFileCount();
                    }
                });
                sounds.push(sound);
            }
            return sounds;
        }());

        /////// Instantiate Pads and Render
        var rows = 0;

        for (var i in this.spriteData) {
            rows++;
            var k = this.columns;
            while (k--) {
                var pad = new Copland.Pad({
                    pitch: i,
                    column: k,
                    row: i - 1,
                    instrument: this
                });

                this.pads.push(pad);
                this.$el.prepend(pad.$el);
                this.$el.css({ width : this.width });
            }
        }
        this.rows = rows;

    };

    Copland.Instrument.prototype.changeSound = function(i) {
        var indices = this.sounds.length;
        this.currentSoundIndex = i || (this.currentSoundIndex + 1) % indices;
    };

    Copland.Instrument.prototype.color = function() {
        return this.colors[ this.currentSoundIndex ];
    };

    Copland.Instrument.prototype.sound = function() {
        return this.sounds[ this.currentSoundIndex ];
    };

    Copland.Instrument.prototype.toggleClickSilent = function() { // pads still play, just not on click
        _.each(this.pads, function(pad) {
            pad.toggleSilent();
        });
    };

    Copland.Instrument.prototype.playCol = function(column) {
        var pads = _.where(this.pads, {column: column});
        _.each(pads, function(pad) {
            if (pad.active) { pad.play(); }
        });
    };

    Copland.Instrument.prototype.clearCol = function(column) {
        var pads = _.where(this.pads, {column: column});
        _.each(pads, function(pad) {
            pad.offActive();
        });
    };

    Copland.Instrument.prototype.clearActive = function() {
        var pads = _.where(this.pads, {active: true});
        _.each(pads, function(pad) {
            pad.toggleActive();
        });
    };

    Copland.Instrument.prototype.startEvolve = function() {
        // Only a 50% chance of running
        if (_.random(0,1) === 1) {

            // Collect some stats on the whole grid, and each row/column
            var totalPads = this.rows * this.columns;
            var activePads = _.where(this.pads, { active: true });
            var inactivePads = _.where(this.pads, { active: false });
            var percFilled = activePads.length / totalPads;
            var mostFilledCol = this.getMostFilledCol();
            var mostFilledRow = this.getMostFilledRow();


            var pads, i;

            if (mostFilledCol.activeCount > 2) {
                pads = mostFilledCol.active;
                i = _.random(0, pads.length - 1);
                pads[i].$el.trigger('click'); // offActive();

            } else if (mostFilledRow.activeCount > 2) {
                pads = mostFilledRow.active;
                i = _.random(0, pads.length - 1);
                pads[i].$el.trigger('click'); // offActive();

            } else if (percFilled > 0.38) {
                i = _.random(0, activePads.length - 1);
                activePads[i].$el.trigger('click'); // offActive();

            } else if (percFilled < 0.29) {
                i = _.random(0, inactivePads.length - 1);
                inactivePads[i].$el.trigger('click'); // onActive();

            } else{
                i = _.random(0, activePads.length - 1);
                activePads[i].$el.trigger('click'); // offActive();

                i = _.random(0, inactivePads.length - 1);
                inactivePads[i].$el.trigger('click'); // onActive();
            }

            if (_.random(0,7) === 7) {
                App.clickSoundsControl();
            }
        }

        var that = this;
        this.timeouts.evolve = setTimeout(function(){
            that.startEvolve.call(that);
        }, 9000);

    };

    Copland.Instrument.prototype.stopEvolve = function() {
        clearTimeout(this.timeouts.evolve);
        this.timeouts.evolve = null;
    };

    Copland.Instrument.prototype.getMostFilledCol = function() {

        return Copland.Utils.getMostFilledCol.call(this);
    };

    Copland.Instrument.prototype.getMostFilledRow = function() {

        return Copland.Utils.getMostFilledRow.call(this);
    };

}(jQuery));
