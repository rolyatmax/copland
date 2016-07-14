import {creators} from './actions';
import store from './store';
import createEncoder from 'encode-object';
import leftPad from 'left-pad';


let {togglePad, setResolution} = creators;

const SOUNDS_COUNT = 9;
const COLUMN_COUNT = 8;

let encoderConfig = {
    resolution: ['int', 1], // resolution - ['high', 'low']
    stringsActive: ['int', 8] // only 8 columns, one active pad per column
};


const digits = Math.pow(2, SOUNDS_COUNT).toString().length;
let i = COLUMN_COUNT;
while (i--) {
     // each column has 9 pads, 2^9 - 1 = 511
    encoderConfig[`c${i}`] = ['int', digits];
}


const { encodeObject, decodeObject } = createEncoder(encoderConfig);
const resolutions = ['low', 'high'];

export function generateHash({resolution, instruments}) {
    // works because SOUNDS_COUNT === 9
    let stringsActive = instruments[1].active.map(col => {
        let activePad = col.find(isActive => isActive);
        return activePad ? col.indexOf(activePad) + 1 : 0;
    }).join('');

    let settings = {
        resolution: resolutions.indexOf(resolution),
        stringsActive: stringsActive
    };

    instruments[0].active.map((col, j) => {
        let bits = col.map(isActive => isActive ? 1 : 0).join('');
        settings[`c${j}`] = parseInt(bits, 2);
    });

    return encodeObject(settings);
}


export function loadPattern(encodedString) {
    let settings;
    try {
        settings = decodeObject(encodedString);
    } catch (e) {
        alert('This link is for an old version of this application and is no longer valid.');
        document.location.hash = '';
        return;
    }

    store.dispatch(setResolution(resolutions[settings.resolution]));

    settings.stringsActive.toString().split('').forEach((activeRow, column) => {
        let instrument = 1;
        activeRow = parseInt(activeRow, 10);
        if (activeRow) {
            let row = activeRow - 1;
            store.dispatch(togglePad({instrument, row, column}));
        }
    });

    for (let j = 0; j < COLUMN_COUNT; j++) {
        let bits = settings[`c${j}`].toString(2);
        leftPad(bits, SOUNDS_COUNT, '0').split('').forEach((isActive, k) => {
            let instrument = 0;
            let column = j;
            if (parseInt(isActive, 10)) {
                let row = k % SOUNDS_COUNT;
                store.dispatch(togglePad({instrument, row, column}));
            }
        });
    }
}
