import { useState } from 'react';
import {
    Panel,
    type PanelPosition,
} from '@xyflow/react';

// import connectionBtn from '../../assets/connection-btn.svg';
import styles from './leftPanel.module.css';

import connectionBtn from '../../assets/connection.svg';
import add from '../../assets/add.svg';
import arrows from '../../assets/arrows.svg';

// PanelProps is supposed to have chlidren. So this custom type is not an extension of PanelProps.
// This is just a wrapper.
type LeftPanelProps = {
    position: PanelPosition,
    defaultMode: string,
    createNode: () => void,
    toggleModes: (newMode: string) => void,
};

function LeftPanel({ position, createNode, toggleModes, defaultMode }: LeftPanelProps) {
    const [active, setActive] = useState('unweighted');

    const [activeMode, setActiveMode] = useState(defaultMode);

    const handleActive = (btnName: string) => {
        setActive(btnName);
    };

    const handleActiveMode = (mode: string) => {
        setActiveMode(mode);
    };

    return (
        <Panel position={position}>
            <div className={styles['left-tool-bar']}>
                <section>
                    <span>Prebuilt Graphs</span>
                    <div className={`${styles['preload-container']}`}>
                        <button className={`${styles['preload-btn']}`}>1</button>
                        <button className={`${styles['preload-btn']}`}>2</button>
                        <button className={`${styles['preload-btn']}`}>3</button>
                    </div>
                </section>

                <section className="graph-section">
                    <span>Graph Type</span>
                    <div className={styles['weighted-btn-container']}>
                        <button
                            className={`
                            ${styles['weight-btn']}
                            ${active === 'weighted' ? `${styles['active-color']}` : ''}
                            `}
                            onClick={() => handleActive('weighted')}
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
                            onClick={() => handleActive('unweighted')}
                        >
                            Unweighted Graph
                        </button>
                    </div>
                </section>

                <section>
                    <span>Modes</span>
                    <div className={`${styles['mode-selection']}`}>
                        <div>
                            <button className={`
                                ${styles['svg-btn']}
                                ${activeMode === 'move' ? `${styles['active-color']}` : ''}
                                `}
                                onClick={() => {
                                    toggleModes('move');
                                    handleActiveMode('move');
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
                                    ${activeMode === 'connect' ? `${styles['active-color']}` : ''}
                                `}
                                onClick={() => {
                                    toggleModes('connect');
                                    handleActiveMode('connect');
                                }}
                                title="Connect Nodes"
                            >
                                <img src={connectionBtn} loading="lazy" alt="Connect Nodes" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <span>Insertions</span>
                    <div className={`${styles['insertion-selection']}`}>
                        <div>
                            <button className={`${styles['svg-btn']}`} onClick={createNode} title="Add Node">
                                <img src={add} loading="lazy" alt="Plus sign" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                        <div>
                            <button className={`${styles['svg-btn']}`} onClick={createNode} title="Add Node">
                                <img src={add} loading="lazy" alt="Plus sign" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                        <div>
                            <button className={`${styles['svg-btn']}`} onClick={createNode} title="Add Node">
                                <img src={add} loading="lazy" alt="Plus sign" className={`${styles['svg-img']}`} />
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <span>Algorithms</span>
                    <form action="" className={`${styles['algorithm-form']}`}>
                        <select name="Selected algorithm" id="select-algorithm" className={`${styles['algorithm-selection']}`} required>
                            <option value="DFS">Depth-first search</option>
                            <option value="BFS">Breadth-first search</option>
                            <option value="A*">A* search</option>
                        </select>
                        <button type="submit" className={`${styles['submit-btn']}`}>Solve</button>
                    </form>
                </section>
            </div>
        </Panel>
    );
}

export default LeftPanel;
