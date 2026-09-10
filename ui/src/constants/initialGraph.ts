import { Edge, Node } from "@xyflow/react";
import { defaultNodeType, defaultMode } from "./defaults";
import { Terminal } from "./enums";


export const initialNodes: Node[] = [
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

export const initialEdges: Edge[] = [];
