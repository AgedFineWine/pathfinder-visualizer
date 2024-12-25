import {
    Panel,
} from '@xyflow/react';
import PropTypes from 'prop-types';


function CustomPanel({ position, createNode, toggleModes }) {
    return (
        <Panel className="custom-panel" position={position}>
            <div id="toolbar">
                <div>
                    <button id="add-node-btn" onClick={createNode}>Add Node</button>
                </div>
                <div>
                    <button id="connect-mode" onClick={() => toggleModes('connect')}>Connect Mode</button>
                </div>
                <div>
                    <button id="move-mode" onClick={() => toggleModes('move')}>Move Mode</button>
                </div>
            </div>
        </Panel>
    );
}

CustomPanel.propTypes = {
    position: PropTypes.string.isRequired,
    createNode: PropTypes.func.isRequired,
    toggleModes: PropTypes.func.isRequired,
};

export default CustomPanel;
