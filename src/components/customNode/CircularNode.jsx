import { Handle, Position, useConnection } from '@xyflow/react';
import PropTypes from 'prop-types';

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
			{/* All handles are rendered initially. */}
			{!connection.inProgress && (
				<Handle
					className={`custom-handle ${data.mode}`}
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

CircularNode.propTypes = {
	id: PropTypes.string.isRequired,
	data: PropTypes.shape({
		label: PropTypes.string.isRequired,
		mode: PropTypes.string.isRequired,
	}).isRequired,
};

export default CircularNode;