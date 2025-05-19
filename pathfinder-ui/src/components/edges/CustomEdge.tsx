import {
    getStraightPath,
    useInternalNode,
    EdgeProps,
    BaseEdge,
    EdgeLabelRenderer,
} from '@xyflow/react';

import { getEdgeParams } from '../../utils/graphMath.ts';
import { EdgeType } from '../../constants/enums.ts';


function CustomEdge({ id, source, target, markerEnd, style, data }: EdgeProps) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) return null;

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <>
            <BaseEdge path={edgePath} id={id} style={style} markerEnd={markerEnd} />
            {data?.edgeType === EdgeType.Weighted &&
                <EdgeLabelRenderer>
                    <input
                        className='nopan'
                        style={{
                            // Position absolute so multiple inputs can be rendered on top of each other.
                            position: 'absolute',
                            pointerEvents: 'all',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            textAlign: 'center',
                            width: '3ch',
                            borderStyle: 'solid',
                            borderRadius: '3px',
                            // display: 'none',
                        }}
                        type="text"
                        required
                    />
                </EdgeLabelRenderer>
            }
        </>
    );
}

export default CustomEdge;
