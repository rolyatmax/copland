import $ from 'jquery';

export default class Pad {
    constructor(options) {
        if (options.pitch === undefined) {
            throw new Error('You must set a pitch to be played');
        }

        var defaults = {
            active: false,
            silent: false
        };

        Object.assign(this, defaults, options);

        this.$el = $('<div>').addClass('pad');
        this.$el.on('click', () => {
            if (this.instrument.limit) {
                this.instrument.clearCol(this.column);
            }
            this.toggleActive();
            if (!this.silent) {
                this.play();
            }
        });
    }

    pulse() {
        this.$el.css({
            opacity: 1,
            backgroundColor: this.instrument.color()
        });
        this.$el.animate({opacity: 0.65});
    }

    play() {
        this.instrument.sound().play(this.pitch);
        this.pulse();
    }

    updateColor() {
        this.$el.css({backgroundColor: this.instrument.color()});
    }

    offActive() {
        this.active = false;
        this.$el.removeClass('active');
        this.$el.css({backgroundColor: 'white'});
    }

    onActive() {
        this.active = true;
        this.$el.addClass('active');
        this.updateColor();
    }

    toggleActive() {
        if (this.active) {
            this.offActive();
        } else {
            this.onActive();
        }
    }

    toggleSilent() {
        this.silent = !this.silent;
    }
}
