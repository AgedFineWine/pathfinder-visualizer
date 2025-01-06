import {
	Handle,
	Position,
	useConnection,
	Node,
	NodeProps,
} from '@xyflow/react';

import { Mode, Terminal } from '../../utils/enums';

import './CircularNode.css';

type CircularNodeData = {
	label: string,
	mode: Mode,
	terminal: Terminal,
};
type CircularNode = Node<CircularNodeData, 'circularNode'>;

// id is already defined in NodeProps
function CircularNode({ id, data }: NodeProps<CircularNode>) {
	const connection = useConnection();

	const isTarget = connection.inProgress && connection.fromNode.id !== id;

	return (
		<div className={`
			custom-node-body
			${data.terminal === Terminal.Start ? 'start' : ''}
			${data.terminal === Terminal.Destination ? 'destination' : ''}
		`}>
			{/* All handles are rendered initially. */}
			{!connection.inProgress && (
				<Handle
					className={`
						custom-handle
						${data.mode}
					`}
					position={Position.Right}
					type="source"
				/>
			)}
			{/* We want to disable the target handle, if the connection was started from this node */}
			{(!connection.inProgress || isTarget) && (
				<Handle
					className={`custom-handle ${data.mode}`}
					position={Position.Left}
					type="target"
					isConnectableStart={false}
				/>
			)}
			{data.label}
		</div>
	);
}

export default CircularNode;
