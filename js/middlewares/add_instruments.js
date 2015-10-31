import {types, creators} from '../actions';
import {Howl} from 'howler';

const {SET_RESOLUTION} = types;
const {addInstrument, fileLoaded} = creators;


function getURLs(resolution) {
    let audioFiles = {
        low: [
            'audio/lowest/morning_sprite_lowest.mp3',
            'audio/lowest/morning_sprite2_lowest.mp3',
            'audio/lowest/morning_sprite4_lowest.mp3',
            'audio/lowest/morning_sprite5_lowest.mp3'
        ],
        high: [
            'audio/morning_sprite.mp3',
            'audio/morning_sprite2.mp3',
            'audio/morning_sprite4.mp3',
            'audio/morning_sprite5.mp3',
            'audio/morning_sprite7.mp3',
            'audio/morning_sprite9.mp3'
        ]
    };

    return audioFiles[resolution];
}


export const addInstruments = store => next => action => {
    let {dispatch} = store;
    switch (action.type) {
    case SET_RESOLUTION:
        let audioFiles = getURLs(action.resolution);
        let onloadSound = () => dispatch(fileLoaded());
        let createInstrument = data => dispatch(addInstrument(data));
        [{
            palettes: audioFiles.map(url => (
                new Howl({
                    urls: [url],
                    sprite: {
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
                    onload: onloadSound
                })
            )),
            sounds: 9,
            measureLength: 8,
            duration: 1,
            limit: false,
            evolve: true,
            soundPalette: 0
        }, {
            palettes: audioFiles.map(url => (
                new Howl({
                    urls: [url],
                    sprite: {
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
                    onload: onloadSound
                })
            )),
            sounds: 9,
            measureLength: 8,
            duration: 16,
            limit: true,
            evolve: true,
            soundPalette: 0
        }].forEach(createInstrument);
        break;
    default:
        break;
    }

    return next(action);
};
