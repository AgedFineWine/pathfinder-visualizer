import { useCallback, useState } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	addEdge,
	ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CircularNode from './components/customNode/CircularNode';
import CustomPanel from './components/Panel';

import './App.css';

let defaultMode = 'move';

const initialNodes = [
	{
		id: '1',
		type: 'circularNode',
		data: {
			label: '1',
			mode: defaultMode, 
		},
		position: { x: 250, y: 25 },
	},
	{
		id: 'test-node',
		type: 'circularNode',
		data: {
			label: 'Test Node',
			mode: defaultMode,
		},
		position: { x: 400, y: 180 },
	},
];

const initialEdges = [];

const nodeTypes = {
	circularNode: CircularNode,
};

// id: 1 is reserved for the first node. So, we start from 2.
let id = 2;
const getId = () => `${id++}`;

function Flow() {
	// This function is used to enable click and drag components.
	// changes variable is an array of nodes
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	// onEdgesChange is used to remove an edge from two nodes.
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const [currentMode, setMode] = useState(defaultMode);

	// This function is used to add an edge to two nodes.
	const onConnect = useCallback((connection) => {
		const newEdge = {
			...connection,
			id: `${connection.source}-${connection.target}`,
			type: 'straight',
		};
		// oldEdges is a list of all the edges in the graph.
		setEdges(oldEdges => {
			return addEdge(newEdge, oldEdges)
		});
	}, [setEdges]);

	const toggleModes = useCallback((newMode) => {
		setMode(newMode);

		setNodes((currentNodes) => {
			return currentNodes.map((node) => {
				const modifiedNode = {
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
	const createNode = useCallback(() => {
		setNodes((currentNodes) => {
			const newId = getId();
			const newNode = {
				id: newId,
				type: 'circularNode',
				data: {
					label: `${newId}`,
					mode: currentMode,
				},
				position: { x: 400, y: 25 },
			};
			return [...currentNodes, newNode];
		});
	}, [currentMode, setNodes] );

	return (
		<ReactFlow
			// colorMode='dark'
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			connectionLineType={'straight'}
			nodeTypes={nodeTypes}
			fitView
		>
			<CustomPanel position="top-left" createNode={createNode}
			toggleModes={toggleModes}
			/>
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
