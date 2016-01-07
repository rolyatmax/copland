import {VERSION} from './constants';
import {creators} from './actions';
import store from './store';
import {
    compressToEncodedURIComponent, decompressFromEncodedURIComponent
} from 'lz-string';


let {togglePad, setResolution} = creators;

const VERS = 'v';
const RESOLUTION = 'r';
const INSTRUMENTS = 'i';
const SOUNDS = 's';
const ACTIVE = 'a';

export function generateHash({resolution, instruments}) {
    let pattern = JSON.stringify({
        [VERS]: VERSION,
        [RESOLUTION]: resolution,
        [INSTRUMENTS]: instruments.map(instrument => {
            let {sounds, active} = instrument;
            return {
                [SOUNDS]: sounds,
                [ACTIVE]: active.map(column =>
                    column.map(isActive => isActive ? 1 : 0).join('')
                ).join('')
            };
        })
    });
    return compressToEncodedURIComponent(pattern);
}


export function loadPattern(encodedString) {
    let decoded = decompressFromEncodedURIComponent(encodedString);
    let pattern = JSON.parse(decoded);
    let {
        [VERS]: version,
        [RESOLUTION]: resolution,
        [INSTRUMENTS]: instruments
    } = pattern;

    if (version !== VERSION) {
        throw new Error(
            'This pattern was saved under a version that is no longer supported'
        );
    }

    store.dispatch(setResolution(resolution));
    instruments.forEach((data, instrument) => {
        let {
            [SOUNDS]: sounds,
            [ACTIVE]: active
        } = data;
        active.split('').forEach((isActive, i) => {
            if (parseInt(isActive, 10)) {
                let row = i % sounds;
                let column = (i / sounds) | 0;
                store.dispatch(togglePad({instrument, row, column}));
            }
        });
    });
}
