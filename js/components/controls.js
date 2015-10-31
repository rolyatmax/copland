import React from 'react';


function Controls({actions, evolving}) {
    let {toggleInfo, toggleSave, toggleEvolving} = actions;

    return (
        <div className="btns">
            <div onClick={toggleInfo} className="open-info">info</div>
            <div onClick={toggleSave} className="save-btn">save</div>
            <div
                onClick={toggleEvolving}
                className={`evolve-btn ${evolving ? 'evolving' : ''}`}>
                evolve
            </div>
        </div>
    );
}

Controls.propTypes = {
    evolving: React.PropTypes.bool.isRequired,
    actions: React.PropTypes.object.isRequired
};

export default Controls;
