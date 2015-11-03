import React from 'react';


function Info({show, children}) {
    return (
        <div
            id="info"
            className={show ? 'open' : ''}
            dangerouslySetInnerHTML={{__html: children}} />
    );
}

Info.propTypes = {
    children: React.PropTypes.node,
    show: React.PropTypes.bool
};

export default Info;
