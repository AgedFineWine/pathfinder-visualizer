import {
    Panel,
    type PanelPosition,
} from '@xyflow/react';

import './Panel.css';

// PanelProps is supposed to have chlidren. So this custom type is not an extension of PanelProps.
// This is just a wrapper.
type CustomPanelProps = {
    position: PanelPosition,
    createNode: () => void,
    toggleModes: (newMode: string) => void,
};

function CustomPanel({ position, createNode, toggleModes }: CustomPanelProps) {
    return (
        <Panel className="custom-panel" position={position}>
            <div id="toolbar">
                <div className="btn-container">
                    <button id="add-node-btn" onClick={createNode}>Add Node</button>
                </div>
                <div className="btn-container">
                    <button id="connect-mode" onClick={() => toggleModes('connect')}>Connect Nodes</button>
                </div>
                <div className="btn-container">
                    <button id="move-mode" onClick={() => toggleModes('move')}>Move Nodes</button>
                </div>
            </div>
        </Panel>
    );
}

export default CustomPanel;
