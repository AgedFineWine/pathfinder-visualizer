import { useCallback, useState } from 'react';
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

import { Mode, Terminal } from './utils/enums.ts';

import CircularNode from './components/customNode/CircularNode.tsx';
import LeftPanel from './components/leftPanel/leftPanel.tsx';
import ArrowEdge from './components/ArrowEdge.tsx';

import './App.css';

const defaultMode = Mode.Move;
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
		},
		position: { x: 0, y: 0 },
	},
];

const initialEdges: Edge[] = [];

const nodeTypes: NodeTypes = {
	circularNode: CircularNode,
};

const edgeTypes = {
	arrowEdge: ArrowEdge,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
	type: 'arrowEdge',
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

	const onNodesChange = useCallback((changes: NodeChange<Node>[]) => {
		if (currentMode === Mode.StartSelect || currentMode === Mode.DestinationSelect) return;
		setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
	}, [setNodes, currentMode]);

	const [edges, setEdges] = useState(initialEdges);

	const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
		if (currentMode === Mode.StartSelect || currentMode === Mode.DestinationSelect) return;
		setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
	}, [setEdges, currentMode]);
	
	const [id, setId] = useState(1);

	const reactFlowInstance = useReactFlow();

	/**
	 * getId() generates a new ID that is guaranteed that it is not already in use.
	 */
	const getId = useCallback(() => {
		let newId: number = id;
		setId((currentId) => {
			newId = currentId;
			for (let i = 1; i < nodes.length + 2; i++) {
				if (nodes.some((node) => node.id === `${i}`)) {
					continue;
				} else {
					newId = i;
					break;
				}
			}
			return newId;
		});

		return `${newId}`;
	}, [nodes, id]);

	// This function is used to add an edge to two nodes.
	const onConnect: OnConnect = useCallback((connection: Connection) => {
		const newEdge: Edge = {
			...connection,
			id: `${connection.source}-${connection.target}`,
		};
		// oldEdges is a list of all the edges in the graph.
		setEdges((oldEdges) => {
			return addEdge(newEdge, oldEdges)
		});
	}, [setEdges]);

	const toggleModes = useCallback((newMode: Mode) => {
		setMode(newMode);

		setNodes((currentNodes) => {
			return currentNodes.map((node) => {
				const modifiedNode: Node = {
					...node,
					data: {
						...node.data,
						mode: newMode,
					}
				};
				return modifiedNode;
			});
		});

	}, [setNodes]);

	// Changes to the nodes must be correspondingly made here.
	const createNode = useCallback((event: React.MouseEvent) => {
		const { x, y } = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
		setNodes((currentNodes) => {
			const newId = getId();
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

	const selectNode = useCallback((event: React.MouseEvent, node: Node) => {
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

	const handleClick = useCallback((event: React.MouseEvent) => {
		if (currentMode !== Mode.Add) return;

		const panel = ((document.getElementsByClassName('react-flow__panel'))[0]);
		const clickedElement = event.target as HTMLElement;
		if (panel.contains(clickedElement)) return;

		if (currentMode === Mode.Add) createNode(event);

	}, [currentMode, createNode]);


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
			onClick={handleClick}
			onNodeClick={selectNode}
			fitView
		>
			<LeftPanel position="top-left" toggleModes={toggleModes} defaultMode={defaultMode} />
			<Background />
			<Controls />
		</ReactFlow>
	);
}

// Function is necessary to satisfy warning: 'Warning: Seems like you have not used zustand provider as an ancestor'.
function FlowWithProvider() {
	return (
		<ReactFlowProvider>
			<Flow />
		</ReactFlowProvider>
	);
}

export default FlowWithProvider;
