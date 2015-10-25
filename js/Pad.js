var Copland = Copland || {};

(function($) {
    'use strict';

    //////// Pad

    Copland.Pad = function(options) {
        if (!options.pitch) { throw 'You must set a pitch to be played'; }

        var that = this;

        //// Setup Defaults

        var defaults = {
            active: false,
            silent: false
        };

        options = _.defaults(options, defaults);

        _.extend(this, options);

        this.$el = $('<div>').addClass('pad');

        ///// Click Event

        this.$el.on('click', function(){

            if (that.instrument.limit) {
                that.instrument.clearCol(that.column);
            }

            that.toggleActive.call(that);

            if (!that.silent) {
                that.play.call(that);
            }
        });

    };

    Copland.Pad.prototype.pulse = function() {
        this.$el.css({
            opacity: 1,
            backgroundColor: this.instrument.color()
        });
        this.$el.animate({opacity: 0.65});
    };

    Copland.Pad.prototype.play = function() {
        this.instrument.sound().play( this.pitch );
        this.pulse();
    };

    Copland.Pad.prototype.updateColor = function() {
        this.$el.css({ backgroundColor: this.instrument.color() });
    };

    Copland.Pad.prototype.offActive = function() {
        this.active = false;
        this.$el.removeClass('active');
        this.$el.css({backgroundColor: 'white'});
    };

    Copland.Pad.prototype.onActive = function() {
        this.active = true;
        this.$el.addClass('active');
        this.updateColor();
    };

    Copland.Pad.prototype.toggleActive = function() {

        (this.active ? this.offActive : this.onActive).call(this);
    };

    Copland.Pad.prototype.toggleSilent = function() {
        this.silent = !this.silent;
    };


}(jQuery));
