import { useCallback, useState } from 'react';
import {
	ReactFlow,
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	addEdge,
	ReactFlowProvider,
    ConnectionLineType,
    MarkerType,
    DefaultEdgeOptions,
    type Node,
    type Edge,
    type NodeTypes,
    type OnConnect,
    type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CircularNode from './components/customNode/CircularNode.tsx';
import LeftPanel from './components/leftPanel/leftPanel.tsx';
import ArrowEdge from './components/ArrowEdge.tsx';

import './App.css';

const defaultMode: string = 'move';
const defaultNodeType: string = 'circularNode';

const initialNodes: Node[] = [
	{
		id: '1',
		type: defaultNodeType, 
		data: {
			label: '1',
			mode: defaultMode, 
		},
		position: { x: 0, y: 0 },
	},
	// {
	// 	id: 'test-node',
	// 	type: defaultNodeType,
	// 	data: {
	// 		label: 'Test Node',
	// 		mode: defaultMode,
	// 	},
	// 	position: { x: 150, y: 150 },
	// },
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
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const [currentMode, setMode] = useState(defaultMode);

	const [id, setId] = useState(1);

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
		const newEdge: Edge  = {
			...connection,
			id: `${connection.source}-${connection.target}`,
		};
		// oldEdges is a list of all the edges in the graph.
		setEdges((oldEdges) => {
			return addEdge(newEdge, oldEdges)
		});
	}, [setEdges]);

	const toggleModes = useCallback((newMode: string) => {
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
	const createNode = useCallback(() => {
		setNodes((currentNodes) => {
			const newId = getId();
			const newNode = {
				id: newId,
				type: defaultNodeType,
				data: {
					label: `${newId}`,
					mode: currentMode,
				},
				position: { x: 400, y: 25 },
			};
			return [...currentNodes, newNode];
		});
	}, [currentMode, setNodes, getId] );

	return (
		<ReactFlow
			// colorMode='dark'
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			connectionLineType={ConnectionLineType.Straight}
			connectionLineStyle={{ strokeWidth: 3}}
			nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
			fitView
		>
			<LeftPanel position="top-left" createNode={createNode} toggleModes={toggleModes} defaultMode={defaultMode}/>
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
