import React from 'react';
import {sample} from 'underscore';


let text = sample([
    'Spinning Hamster Wheels', 'Milking the Cows',
    'Brewing the Coffee', 'Loading Audio Files',
    'Solving Rubiks Cube', 'Filtering Water',
    'Sharpening Pencils'
]);

function Loader({appState}) {
    let {filesLoaded, filesToLoad} = appState;
    let perc = ((filesLoaded / filesToLoad * 100) + 0.5) | 0;

    return (
        <div className="loader">
            <h3>{text}...</h3>
            <div id="perc">{perc}%</div>
        </div>
    );
}

Loader.propTypes = {
    appState: React.PropTypes.object.isRequired
};

export default Loader;
