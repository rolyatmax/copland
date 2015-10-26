import $ from 'jquery';
import Instrument from './Instrument';

let $el = $('#app');

let colors = '#A67C87 #3F5573 #6A8AA6 #DAB6B6 #F2E4E4 #656975 #745D71'.split(' ');

let BASE_URL = window.location.origin + window.location.pathname;

let VERSION = '2.0';
let tempo = 400;
let PAD_WIDTH = 40;
let timeout = null;
let els = {};
let filesLoaded = 0;
let filesToLoad;


export default {
    $el: $el,
    colors: colors,
    VERSION: VERSION,

    init: function({resolution = 'high'}) {
        let audioFiles = getURLs(resolution === 'low');
        filesToLoad = audioFiles.length * 2;

        let onloadSound = () => {
            filesLoaded++;
            checkFileCount(() => this.onFinishLoad());
        };

        let clickSoundsControl = () => this.clickSoundsControl();

        this.instruments = [{
            spriteData: {
                1: [0, 3000],
                2: [4000, 3000],
                3: [8000, 3000],
                4: [12000, 3000],
                5: [16000, 3000],
                6: [20000, 3000],
                7: [24000, 3000],
                8: [28000, 3000],
                9: [32000, 3000]
            },
            columns: 8,
            urls: audioFiles,
            rhythmicValue: 1,
            limit: false,
            evolve: true,
            colors: colors
        }, {
            spriteData: {
                1: [35000, 8500],
                2: [45000, 8500],
                3: [54000, 8500],
                4: [65000, 8500],
                5: [75000, 8500],
                6: [84000, 8500],
                7: [95000, 8500],
                8: [105000, 8500],
                9: [114000, 8500]
            },
            columns: 8,
            urls: audioFiles,
            rhythmicValue: 16,
            limit: true,
            evolve: true,
            colors: colors
        }].map(({spriteData, urls, rhythmicValue, columns, limit, evolve}) => (
            new Instrument({spriteData, urls, rhythmicValue, columns,
                limit, evolve, colors,
                width: columns * PAD_WIDTH,
                onloadSound: onloadSound,
                clickSoundsControl: clickSoundsControl
            })
        ));

        this.render();
        this.cacheElements();

        $(document).on('keydown', e => {
            switch (e.which) {
            // backspace
            case 8:
                e.preventDefault();
                this.stopLoop();
                this.instruments.forEach(instrument => instrument.clearActive());
                break;
            // `e`
            case 69:
                this.toggleEvolve();
                break;
            // `s`
            case 83:
                this.clickSave();
                break;
            // `i`
            case 73:
                this.toggleInfo();
                break;
            // space
            case 13:
                this.toggleLoop();
                break;
            // enter
            case 32:
                this.toggleLoop();
                break;
            default:
                break;
            }
        });

        els.$container.on('click', '.sounds_control', e => this.clickSoundsControl(e))
            .on('click', '.save_btn', () => this.clickSave())
            .on('click', '.evolve_btn', () => this.toggleEvolve());
        els.$savedPopup.find('.close').on('click', () => this.closeSavedPopup());
    },

    onFinishLoad: function() {
        let playLoop = () => this.playLoop();
        $('.bottombar').addClass('loaded').on('webkitTransitionEnd', e => {
            if (e.originalEvent.propertyName !== 'bottom') {
                return;
            }
            $('#res_popup').fadeOut();
            playLoop();
            $(this).off('transitionend');
        });
    },

    cacheElements: function() {
        els = {
            $container: $('#container'),
            $info: $('#info'),
            $mainView: $('#main_view'),
            $savedPopup: $('.saved_popup'),
            $soundsControl: $('.sounds_control'),
            $evolveBtn: $('.evolve_btn'),
            $bottombar: $('.bottombar')
        };
    },

    toggleInfo: function() {
        els.$info.toggleClass('open');
        els.$mainView.toggleClass('inactive');
    },

    openInfo: function() {
        els.$info.addClass('open');
        els.$mainView.addClass('inactive');
    },

    closeInfo: function() {
        els.$info.removeClass('open');
        els.$mainView.removeClass('inactive');
    },

    closeSavedPopup: function() {
        els.$savedPopup.removeClass('show');
    },

    render: function() {
        this.instruments.forEach(instrument => this.$el.append(instrument.$el));

        // Render Sounds Controller Button
        let div = $('<div>')
            .addClass('sounds_control')
            .css({backgroundColor: this.instruments[0].color()});

        this.$el.append(div);
    },

    toggleLoop: function() {
        if (timeout) {
            this.stopLoop();
        } else {
            this.playLoop();
        }
    },

    playLoop: function() {
        this.instruments.forEach(instrument => instrument.toggleClickSilent());
        this.instruments.forEach(instrument => instrument.currentCol = 0);

        let beats = 0;
        let instruments = this.instruments;
        timeout = setTimeout(step, tempo);

        function step() {
            if (beats % 8 === 0) {
                let index = beats % colors.length;
                els.$bottombar.css({backgroundColor: colors[index]});
            }

            instruments
                .filter(instrument => beats % instrument.rhythmicValue === 0)
                .forEach(instrument => {
                    instrument.playCol(instrument.currentCol % instrument.columns);
                    instrument.currentCol++;
                });

            beats++;
            timeout = setTimeout(step, tempo);
        }
    },

    stopLoop: function() {
        this.instruments.forEach(instrument => instrument.toggleClickSilent());
        this.stopEvolve();
        clearTimeout(timeout);
        timeout = null;
    },

    clickSoundsControl: function(e, colorIndex) {
        this.changeAllSounds(colorIndex);
        let color = this.instruments[0].color();
        els.$soundsControl.css({backgroundColor: color});
    },

    changeAllSounds: function(colorIndex) {
        this.instruments.forEach(instrument => instrument.changeSound(colorIndex));
    },

    toggleEvolve: function() {
        if (this.evolving) {
            this.stopEvolve();
        } else {
            this.startEvolve();
        }
    },

    startEvolve: function() {
        if (this.evolving) {
            return;
        }
        this.instruments
            .filter(instr => instr.evolve)
            .forEach(instr => instr.startEvolve());
        this.evolving = true;
        els.$evolveBtn.addClass('evolving');
    },

    stopEvolve: function() {
        if (!this.evolving) {
            return;
        }
        this.instruments
            .filter(instr => instr.timeouts.evolve)
            .forEach(instr => instr.stopEvolve());
        this.evolving = false;
        els.$evolveBtn.removeClass('evolving');
    },

    //////////// SAVING AND LOADING

    clickSave: function() {
        let code = generateHash({
            resolution: this.resolution,
            instruments: this.instruments
        });
        let url = BASE_URL + '#load/' + code;

        els.$savedPopup.css({ opacity: 0.1 });
        els.$savedPopup.find('textarea').val(url)
            .parent().addClass('show')
            .css({ opacity: 1 });
    },

    loadPattern: function(encodedString) {
        let pattern = Base64.btou(
            RawDeflate.inflate(Base64.fromBase64(encodedString))
        );
        pattern = JSON.parse(pattern);
        validatePattern(pattern, this.instruments);
        let soundIndex = pattern.instruments[0].currentSoundIndex;
        this.clickSoundsControl(null, soundIndex);
        this.instruments.forEach((instrument, i) => {
            let {bits} = pattern.instruments[i];
            instrument.pads.forEach((pad, j) => {
                if (bits[j]) {
                    pad.onActive();
                } else {
                    pad.offActive();
                }
            });
        });
    },
};

function validatePattern(pattern, instruments) {
    if (pattern.version !== VERSION) {
        throw new Error(
            'This pattern was saved under a different version than the ' +
            'current version'
        );
    }

    instruments.forEach((instrument, i) => {
        let {rows, columns} = pattern.instruments[i];
        if (instrument.rows !== rows) {
            throw new Error(
                'Error: saved instrument does not have the right number ' +
                'of rows'
            );
        }

        if (instrument.columns !== columns) {
            throw new Error(
                'Error: saved instrument does not have the right number ' +
                'of columns'
            );
        }
    });
}


function generateHash({resolution, instruments}) {
    let pattern = JSON.stringify({
        version: VERSION,
        resolution: resolution,
        instruments: instruments.map((instrument) => {
            let {columns, rows, currentSoundIndex, pads} = instrument;
            let bits = pads.map(pad => pad.active ? 1 : 0);
            return {columns, rows, currentSoundIndex, bits};
        })
    });
    return encodeURIComponent(
        Base64.toBase64(RawDeflate.deflate(Base64.utob(pattern)))
    );
}


function checkFileCount(onload) {
    let perc = ((filesLoaded / filesToLoad * 100) + 0.5) | 0;
    perc += '%';
    let index = filesLoaded % colors.length;
    $('#perc').text(perc);
    $('.bottombar').css({
        width: perc,
        backgroundColor: colors[index]
    });
    if (filesLoaded === filesToLoad) {
        onload();
    }
}


function getURLs(isLowRes) {
    if (isLowRes) {
        return [
            'audio/lowest/morning_sprite_lowest.mp3',
            'audio/lowest/morning_sprite2_lowest.mp3',
            'audio/lowest/morning_sprite4_lowest.mp3',
            'audio/lowest/morning_sprite5_lowest.mp3'
        ];
    }

    return [
        'audio/morning_sprite.mp3',
        'audio/morning_sprite2.mp3',
        'audio/morning_sprite4.mp3',
        'audio/morning_sprite5.mp3',
        'audio/morning_sprite7.mp3',
        'audio/morning_sprite9.mp3'
    ];
}
