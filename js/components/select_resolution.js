import React from 'react';


function SelectResolution({actions}) {
    return (
        <div id="res-popup">
            <div id="popup-ui">
                <h1>Gotta Load Some Audio Files</h1>
                <h2 onClick={() => actions.setResolution('high')}>High Resolution</h2>
                <p>or</p>
                <h2 onClick={() => actions.setResolution('low')}>Low Resolution</h2>
            </div>
        </div>
    );
}

SelectResolution.propTypes = {
    actions: React.PropTypes.object
};

export default SelectResolution;
