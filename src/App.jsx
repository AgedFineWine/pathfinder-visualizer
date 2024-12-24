import { useCallback, useRef } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	useReactFlow,
	addEdge,
	ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CircularNode from './components/customNode/CircularNode';

import './App.css';


const initialNodes = [
	{
		id: '1',
		type: 'circularNode',
		data: {
			label: '1'
		},
		position: { x: 250, y: 25 },
	},
	{
		id: 'test-node',
		type: 'circularNode',
		data: {
			label: 'Test Node'
		},
		position: { x: 400, y: 180 },
	},
];

const initialEdges = [];

const nodeTypes = {
	circularNode: CircularNode,
};

// id 1 is reserved for the first node.
let id = 2;
const getId = () => `${id++}`;

function Flow() {
	// This function is used to enable click and drag components.
	// changes variable is an array of nodes
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	// onEdgesChange is used to remove an edge from two nodes.
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);


	// for creating new Nodes
	const { screenToFlowPosition } = useReactFlow();

	
	// This function is used to add an edge to two nodes.
	const onConnect = useCallback((connection) => {
		const newEdge = {
			...connection,
			id: `${connection.source}-${connection.target}`,
			type: 'straight',
		};
		// Edges is a list of all the edges in the graph.
		setEdges(oldEdges => addEdge(newEdge, oldEdges));
	}, [setEdges]);


	// Responsible for creating a new node and edge when a connection is made.
	// The onConnectEnd callback will fire when a valid or invalid connection is attempted.
	const onConnectEnd = useCallback((event, connectionState) => {
		if (!connectionState.isValid) {
			const id = getId();
			const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
			const newNode = {
				id,
				type: 'circularNode',
				data: {
					label: id,
				},
				position: screenToFlowPosition({ x: clientX, y: clientY }),
			};

			const newEdge = {
				id: `${connectionState.fromNode.id}-${id}`,
				source: connectionState.fromNode.id,
				target: id,
				type: 'straight',
			};

			setNodes((currentNodes) => currentNodes.concat(newNode));
			setEdges((currentEdges) => currentEdges.concat(newEdge));
		}
	}, [screenToFlowPosition, setNodes, setEdges]);


	return (
		<ReactFlow
			// colorMode='dark'
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onConnectEnd={onConnectEnd}
			connectionLineType={'straight'}
			nodeTypes={nodeTypes}
			fitView
		>
			<Background />
			<Controls />
		</ReactFlow>
	);
}

function FlowWithProvider() {
	return (
		<ReactFlowProvider>
			<Flow />
		</ReactFlowProvider>
	);
}

export default FlowWithProvider;
