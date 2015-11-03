import React from 'react';
import {COLORS} from '../constants';


function BottomBar({appState}) {
    let {filesLoaded, filesToLoad, currentTick} = appState;
    let isLoading = filesToLoad && filesLoaded < filesToLoad;
    let hasLoaded = filesToLoad && !isLoading;
    let perc = isLoading ? ((filesLoaded / filesToLoad * 100) + 0.5) | 0 : 100;
    let width = `${perc}%`;
    let index = isLoading ? filesLoaded : (currentTick / 8) | 0;
    let backgroundColor = COLORS[index % COLORS.length];
    return (
        <div
            className={`bottombar ${hasLoaded ? 'loaded' : ''}`}
            style={{width, backgroundColor}}>
        </div>
    );
}

BottomBar.propTypes = {
    appState: React.PropTypes.object.isRequired
};

export default BottomBar;
