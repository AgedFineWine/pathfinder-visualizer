import { useCallback, useState, useRef, useEffect } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	applyEdgeChanges,
	applyNodeChanges,
	addEdge,
	ReactFlowProvider,
	ConnectionLineType,
	MarkerType,
	DefaultEdgeOptions,
	useReactFlow,
	NodeChange,
	EdgeChange,
	type Node,
	type Edge,
	type NodeTypes,
	type OnConnect,
	type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Mode, Terminal, EdgeType } from './utils/enums.ts';

import CircularNode from './components/customNode/CircularNode.tsx';
import LeftPanel from './components/leftPanel/LeftPanel.tsx';
import WeightedEdge from './components/WeightedEdge.tsx';

import './App.css';

const defaultMode = Mode.Move;
const defaultEdgeType = EdgeType.Unweighted;
const defaultNodeType: string = 'circularNode';
const radius: number = 50;

const initialNodes: Node[] = [
	{
		id: '1',
		type: defaultNodeType,
		data: {
			label: '1',
			mode: defaultMode,
			terminal: Terminal.Start,
			edgeType: defaultEdgeType,
		},
		position: { x: 0, y: 0 },
	},
];

const initialEdges: Edge[] = [];

const nodeTypes: NodeTypes = {
	circularNode: CircularNode,
};

const edgeTypes = {
	weightedEdge: WeightedEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
	type: 'weightedEdge',
	markerEnd: {
		type: MarkerType.ArrowClosed,
	},
	style: {
		strokeWidth: 3,
	}
};

function Flow() {
	const [currentMode, setMode] = useState<Mode>(defaultMode);


	const [nodes, setNodes] = useState(initialNodes);
	/**
	 * onNodesChange() is used to update the nodes on the pane. It is called whenever the nodes change.
	 * Like when nodes move.
	 * 
	 * @param changes The changes to the nodes on the pane.
	*/
	const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
		if (currentMode === Mode.StartSelect || currentMode === Mode.DestinationSelect) return;
		// NOTE: Only applyNodeChanges if we need to move the nodes around.
		setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
	}, [setNodes, currentMode]);


	const [edges, setEdges] = useState(initialEdges);
	/**
	 * onEdgesChange() is used to update the edges on the pane. It is called whenever the edges change.
	 * Like when edges are added or removed.
	 * 
	 * @param changes The changes to the edges on the pane.
	 */
	const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
		if (currentMode === Mode.StartSelect || currentMode === Mode.DestinationSelect) return;
		// NOTE: Only applyNodeChanges if we need to move the nodes around.
		setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
	}, [setEdges, currentMode]);


	const [id, setId] = useState(1);
	/**
	 * getId() generates a new ID that is guaranteed that it is not already in use.
	 * This is necessary because the user can delete nodes and the ID of the node is not reused.
	 */
	const getId = useCallback(() => {
		let newId: number = id;
		for (let i = 1; i < nodes.length + 2; i++) {
			if (nodes.some((node) => node.id === `${i}`)) {
				continue;
			} else {
				newId = i;
				break;
			}
		}
		return `${newId}`;
	}, [nodes, id]);


	/**
	 * onConnect() is used to connect two nodes. This is what the user sees before releasing their mouse.
	 * Once the user releases their mouse, the connection is finalized and added to the list of edges.
	 * 
	 * @param connection The ongoing connection between two nodes.
	 */
	const onConnect: OnConnect = useCallback((connection: Connection) => {
		const newEdge: Edge = {
			...connection,
			id: `${connection.source}-${connection.target}`,
		};
		setEdges((oldEdges) => {
			return addEdge(newEdge, oldEdges)
		});
	}, [setEdges]);


	// NOTE: Empty string '' represents the grab cursor.
	const cursorStyleRef = useRef<'crosshair' | ''>('');
	useEffect(() => {
		const pane = document.getElementsByClassName('react-flow__pane')[0] as HTMLElement;

		if (pane) {
			pane.style.cursor = cursorStyleRef.current;
		}

	}, [currentMode]);
	/**
	 * toggleModes() is used to toggle between the different modes of the application.
	 * 
	 * @param newMode The new mode to set.
	 */
	const toggleModes = useCallback((newMode: Mode) => {
		cursorStyleRef.current = newMode === Mode.Add ? 'crosshair' : '';

		setNodes((currentNodes) => {
			return currentNodes.map((node) => {
				const modifiedNode: Node = {
					...node,
					data: {
						...node.data,
						mode: newMode,
					},
					draggable: newMode === Mode.Move ? true : false,
				};
				return modifiedNode;
			});
		});

		setMode(newMode);
	}, [setNodes]);


	const reactFlowInstance = useReactFlow();
	/**
	 * createNode() is used to create a new node on the pane.
	 * 
	 * @param event The event that triggered the creation of a new node. Event is used to get the position of the click.
	 * must use reactFlowInstance.screenToFlowPosition() to translate the client position to the flow position.
	 */
	const createNode = useCallback((event: React.MouseEvent) => {
		const { x, y } = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
		setNodes((currentNodes) => {
			const newId = getId();
			setId((oldId) => Math.max(oldId, parseInt(newId)));
			const newNode = {
				id: newId,
				type: defaultNodeType,
				data: {
					label: `${newId}`,
					mode: currentMode,
					terminal: null,
				},
				position: { x: x - radius, y: y - radius },
			};
			return [...currentNodes, newNode];
		});
	}, [currentMode, setNodes, getId, reactFlowInstance]);


	/**
	 * selectNode() is used to select a node as a start or destination node. It is part of the 
	 * selection part of the Node Selectors of the panel.
	 * 
	 * @param _event The event that triggered the selection. (Not needed in this function)
	 * @param node The node on the pane that was selected.
	 */
	const selectNode = useCallback((_event: React.MouseEvent, node: Node) => {
		// Convert Mode to Terminal enum.
		const terminal = currentMode === Mode.StartSelect ? Terminal.Start :
			(currentMode === Mode.DestinationSelect ? Terminal.Destination
				: null);

		if (!terminal) return;

		setNodes((currentNodes) => {
			return currentNodes.map((n) => {
				if (n.data.terminal === terminal) {
					return {
						...n,
						data: {
							...n.data,
							terminal: null,
						}
					};
				}
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							terminal: terminal,
						}
					};
				}
				return n;
			});
		});

	}, [currentMode, setNodes]);


	/**
	 * spawnNode() is used to spawn a new node when the user clicks on the pane.
	 * 
	 * @param event The event that triggered the creation of a new node. Event is used to get the position
	 * of the click.
	 */
	const spawnNode = useCallback((event: React.MouseEvent) => {
		if (currentMode !== Mode.Add) return;

		createNode(event);
	}, [currentMode, createNode]);


	const [, setEdgeType] = useState<EdgeType>(defaultEdgeType);
	/**
	 * toggleEdgeType() is used to toggle the edge type between weighted and unweighted.
	 * 
	 * @param newEdgeType The new edge type to set.
	 */
	const toggleEdgeType = useCallback((newEdgeType: EdgeType) => {
		setEdgeType(newEdgeType);

		setNodes((currentNodes) => {
			return currentNodes.map((node) => {
				const modifiedNode: Node = {
					...node,
					data: {
						...node.data,
					}
				};
				return modifiedNode;
			});
		});
	}, []);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			connectionLineType={ConnectionLineType.Straight}
			connectionLineStyle={{ strokeWidth: 3 }}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			defaultEdgeOptions={defaultEdgeOptions}
			onPaneClick={spawnNode}
			onNodeClick={selectNode}
			fitView
		>
			<LeftPanel position="top-left" toggleModes={toggleModes} defaultMode={defaultMode} toggleEdgeType={toggleEdgeType} />
			<Background />
			<Controls />
		</ReactFlow>
	);
}

// NOTE: Function is necessary to satisfy warning: 'Warning: Seems like you have not used zustand provider as an ancestor'.
function FlowWithProvider() {
	return (
		<ReactFlowProvider>
			<Flow />
		</ReactFlowProvider>
	);
}

export default FlowWithProvider;
