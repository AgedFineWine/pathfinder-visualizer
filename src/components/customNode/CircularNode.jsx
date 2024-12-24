import { Handle, Position, useConnection } from '@xyflow/react';

import './CircularNode.css';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
function CircularNode({ id, data }) {
	const connection = useConnection();

	const isTarget = connection.inProgress && connection.fromNode.id !== id;

	return (
		<div className="custom-node-body">
			{/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
			{/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
			{/* Handles are present initially */}
			{!connection.inProgress && (
				<Handle
					className={`custom-handle ${data.mode}`}
					position={Position.Right}
					type="source"
				/>
			 )}
			{/* We want to disable the target handle, if the connection was started from this node */}
			{(!connection.inProgress || isTarget) && (
				<Handle className={`custom-handle ${data.mode}`} position={Position.Left} type="target" isConnectableStart={false} />
			)}
			
			{data.label}
		</div>
	);
}

export default CircularNode;