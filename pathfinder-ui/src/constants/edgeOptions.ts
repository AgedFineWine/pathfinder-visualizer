import { DefaultEdgeOptions, MarkerType } from "@xyflow/react";

export const defaultEdgeOptions: DefaultEdgeOptions = {
	type: 'customEdge',
	markerEnd: {
		type: MarkerType.ArrowClosed,
	},
	style: {
		strokeWidth: 3,
	}
};
