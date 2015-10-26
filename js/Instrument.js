import $ from 'jquery';
import {random, max} from 'underscore';
import Pad from './Pad';
import {Howl} from 'howler';


export default class Instrument {
    constructor(options) {
        let defaults = {
            columns: 8,
            timeouts: {},
            rhythmicValue: 1,
            limit: false,
            currentSoundIndex: 0,
            evolve: false
        };

        Object.assign(this, defaults, options);

        this.width = this.width + 'px';
        this.$el = $('<div>').addClass('instrument');
        this.pads = [];
        this.sounds = this.urls.map(url => (
            new Howl({
                urls: [url],
                sprite: Object.assign({}, this.spriteData),
                onload: options.onloadSound
            })
        ));

        this.rows = Object.keys(this.spriteData).length;
        for (let i = 0; i < this.rows; i++) {
            let k = this.columns;
            while (k--) {
                let pad = new Pad({
                    pitch: i + 1,
                    column: k,
                    row: i,
                    instrument: this
                });

                this.pads.push(pad);
                this.$el.prepend(pad.$el);
                this.$el.css({width: this.width});
            }
        }
    }

    changeSound(i) {
        let indices = this.sounds.length;
        this.currentSoundIndex = i || (this.currentSoundIndex + 1) % indices;
    }

    color() {
        return this.colors[this.currentSoundIndex];
    }

    sound() {
        return this.sounds[this.currentSoundIndex];
    }

    toggleClickSilent() { // pads still play, just not on click
        this.pads.forEach(pad => pad.toggleSilent());
    }

    playCol(column) {
        this.pads
            .filter(pad => pad.column === column && pad.active)
            .forEach(pad => pad.play());
    }

    clearCol(column) {
        this.pads
            .filter(pad => pad.column === column)
            .forEach(pad => pad.offActive());
    }

    clearActive() {
        this.pads
            .filter(pad => pad.active)
            .forEach(pad => pad.offActive());
    }

    startEvolve() {
        this.timeouts.evolve = setTimeout(() => this.startEvolve(), 9000);

        // Only a 50% chance of running
        if (random(0, 1) === 1) {
            return;
        }

        // Collect some stats on the whole grid, and each row/column
        let totalPads = this.rows * this.columns;
        let activePads = this.pads.filter(pad => pad.active);
        let inactivePads = this.pads.filter(pad => !pad.active);
        let percFilled = activePads.length / totalPads;
        let mostFilledCol = this.getMostFilledCol();
        let mostFilledRow = this.getMostFilledRow();

        let i;

        if (mostFilledCol.length > 2) {
            i = random(0, mostFilledCol.length - 1);
            mostFilledCol[i].$el.trigger('click'); // offActive();

        } else if (mostFilledRow.length > 2) {
            i = random(0, mostFilledRow.length - 1);
            mostFilledRow[i].$el.trigger('click'); // offActive();

        } else if (percFilled > 0.38) {
            i = random(0, activePads.length - 1);
            activePads[i].$el.trigger('click'); // offActive();

        } else if (percFilled < 0.29) {
            i = random(0, inactivePads.length - 1);
            inactivePads[i].$el.trigger('click'); // onActive();

        } else {
            i = random(0, activePads.length - 1);
            activePads[i].$el.trigger('click'); // offActive();

            i = random(0, inactivePads.length - 1);
            inactivePads[i].$el.trigger('click'); // onActive();
        }

        if (random(0, 7) === 7) {
            this.clickSoundsControl();
        }
    }

    stopEvolve() {
        clearTimeout(this.timeouts.evolve);
        this.timeouts.evolve = null;
    }

    getMostFilledCol() {
        let columnData = this.pads
            .filter(pad => pad.active)
            .reduce((columns, pad) => {
                columns[pad.column] = columns[pad.column] || [];
                columns[pad.column].push(pad);
                return columns;
            }, []);

        return max(columnData, column => column && column.length);
    }

    getMostFilledRow() {
        let rowData = this.pads
            .filter(pad => pad.active)
            .reduce((rows, pad) => {
                rows[pad.row] = rows[pad.row] || [];
                rows[pad.row].push(pad);
                return rows;
            }, []);

        return max(rowData, row => row && row.length);
    }
}
