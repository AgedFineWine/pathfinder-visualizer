import {
    Panel,
} from '@xyflow/react';


function CustomPanel({ position, createNode, toggleModes }) {
    return (
        <Panel className="custom-panel" position={position}>
            <div id="toolbar">
                <button id="add-node-btn" onClick={createNode}>Add Node</button>
                <div>
                    <button id="connect-mode" onClick={() => toggleModes('connect')}>Connect Mode</button>
                    <button id="move-mode" onClick={() => toggleModes('move')}>Move Mode</button>
                </div>
            </div>
        </Panel>
    );
}

export default CustomPanel;
