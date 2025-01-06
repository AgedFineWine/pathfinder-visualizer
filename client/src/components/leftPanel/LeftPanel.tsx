import { useState } from 'react';
import {
    Panel,
    type PanelPosition,
} from '@xyflow/react';

import { Mode, EdgeType } from '../../utils/enums';

import styles from './leftPanel.module.css';

import connectionBtn from '../../assets/connection.svg';
import add from '../../assets/add.svg';
import arrows from '../../assets/arrows.svg';
import arrowRight from '../../assets/arrow-right.svg';
import goal from '../../assets/goal.svg';

// PanelProps is supposed to have chlidren. So this custom type is not an extension of PanelProps.
// This is just a wrapper.
type LeftPanelProps = {
    position: PanelPosition,
    defaultMode: string,
    toggleModes: (newMode: Mode) => void,
    toggleEdgeType: (newEdgeType: EdgeType) => void,
};

function LeftPanel({ position, toggleModes, defaultMode, toggleEdgeType }: LeftPanelProps) {
    const [active, setActiveEdge] = useState('unweighted');

    const [activeMode, setActiveMode] = useState(defaultMode);

    const handleActiveEdge = (btnName: string) => {
        setActiveEdge(btnName);
    };

    const handleActiveMode = (mode: string) => {
        setActiveMode(mode);
    };

    return (
        <Panel position={position}>
            <div className={styles['left-tool-bar']}>
                <section>
                    <span>Preset Graphs</span>
                    <div className={`${styles['preload-container']}`}>
                        <button className={`${styles['preload-btn']}`}>1</button>
                        <button className={`${styles['preload-btn']}`}>2</button>
                        <button className={`${styles['preload-btn']}`}>3</button>
                    </div>
                </section>

                <section className="graph-section">
                    <span>Edge Type</span>
                    <div className={styles['weighted-btn-container']}>
                        <button
                            className={`
                            ${styles['weight-btn']}
                            ${active === 'weighted' ? `${styles['active-color']}` : ''}
                            `}
                            onClick={() => handleActiveEdge('weighted')}
                        >
                            Weighted Graph
                        </button>
                    </div>
                    <div className={styles['weighted-btn-container']}>
                        <button
                            className={`
                            ${styles['weight-btn']}
                            ${active === 'unweighted' ? `${styles['active-color']}` : ''}
                            `}
                            onClick={() => handleActiveEdge('unweighted')}
                        >
                            Unweighted Graph
                        </button>
                    </div>
                </section>

                <section>
                    <span>Edit Modes</span>
                    <div className={`${styles['mode-selection']}`}>
                        <div>
                            <button className={`
                                ${styles['svg-btn']}
                                ${activeMode === Mode.Move ? `${styles['active-color']}` : ''}
                                `}
                                onClick={() => {
                                    toggleModes(Mode.Move);
                                    handleActiveMode(Mode.Move);
                                }}
                                title="Move Nodes"
                            >
                                <img src={arrows} loading="lazy" alt="Arrows pointing 4 directions" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                        <div>
                            <button
                                className={`
                                    ${styles['svg-btn']}
                                    ${activeMode === Mode.Connect ? `${styles['active-color']}` : ''}
                                `}
                                onClick={() => {
                                    toggleModes(Mode.Connect);
                                    handleActiveMode(Mode.Connect);
                                }}
                                title="Connect Nodes"
                            >
                                <img src={connectionBtn} loading="lazy" alt="Connect Nodes" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                        <div>
                            <button className={`
                                ${styles['svg-btn']}
                                ${activeMode === Mode.Add ? `${styles['active-color']}` : ''}
                            `} onClick={() => {
                                    toggleModes(Mode.Add);
                                    handleActiveMode(Mode.Add);
                                }} title="Add Node">
                                <img src={add} loading="lazy" alt="Plus sign" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <span>Start & End Nodes</span>
                    <div className={`${styles['insertion-selection']}`}>
                        <div>
                            <button className={`
                                ${styles['svg-btn']}
                                ${activeMode === Mode.StartSelect ? `${styles['active-color']}` : ''}
                            `} onClick={() => {
                                    toggleModes(Mode.StartSelect);
                                    handleActiveMode(Mode.StartSelect);
                                }} title="Start Node">
                                <img src={arrowRight} loading="lazy" alt="Arrow right" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                        <div>
                            <button className={`
                                ${styles['svg-btn']}
                                ${activeMode === Mode.DestinationSelect ? `${styles['active-color']}` : ''}
                            `} onClick={() => {
                                    toggleModes(Mode.DestinationSelect);
                                    handleActiveMode(Mode.DestinationSelect);
                                }} title="Destination Node">
                                <img src={goal} loading="lazy" alt="Goal icon" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <span>Traversal Algorithm</span>
                    <form action="" className={`${styles['algorithm-form']}`}>
                        <select name="Selected algorithm" id="select-algorithm" className={`${styles['algorithm-selection']}`} required>
                            <option value="DFS">Depth-first search</option>
                            <option value="BFS">Breadth-first search</option>
                            <option value="A*">A* search</option>
                        </select>
                        <button type="submit" className={`${styles['submit-btn']}`}>Run</button>
                    </form>
                </section>
            </div>
        </Panel>
    );
}

export default LeftPanel;
