import React from 'react';
import {COLORS} from '../constants';


function PaletteSelector({instruments, actions}) {
    let {soundPalette} = instruments[0];
    return (
        <div
            onClick={actions.changeSoundPalette}
            className="sounds-control"
            style={{backgroundColor: COLORS[soundPalette]}}>
        </div>
    );
}

PaletteSelector.propTypes = {
    instruments: React.PropTypes.array.isRequired,
    actions: React.PropTypes.object.isRequired
};

export default PaletteSelector;
