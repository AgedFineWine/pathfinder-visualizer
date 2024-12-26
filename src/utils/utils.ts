import { Position, MarkerType, InternalNode } from '@xyflow/react';

interface IntersectionCalculation {
	base: number,
	height: number,
	radius: number,
	centerInterX: number,
	centerInterY: number,
	centerTargetX: number,
	centerTargetY: number
};

function scenarioA({ base, height, radius, centerInterX, centerInterY, centerTargetX, centerTargetY }: IntersectionCalculation, rightIntersection: boolean) {
	// We assume the point is on the left side (intersection point) of the target node.
	let angleInRadians = Math.atan(base / height);

	// If assumption is false we overwrite by finding the complementary angle.
	let x;
	let y;

	if (rightIntersection) {
		// If assumption is false we overwrite by finding the complementary angle.
		angleInRadians = (Math.PI / 2) - angleInRadians;
		const dx = radius * Math.cos(angleInRadians);
		const dy = radius * Math.sin(angleInRadians);
		x = centerTargetX - dx;
		y = centerTargetY - dy;
	} else {
		// For left intersection.
		const dx = radius * Math.sin(angleInRadians);
		const dy = radius * Math.cos(angleInRadians);
		x = centerInterX + dx;
		y = centerInterY + dy;
	}
	return { x, y };
}

function scenarioB ({ base, height, radius, centerInterX, centerInterY, centerTargetX, centerTargetY }: IntersectionCalculation , rightIntersection: boolean) {
	let angleInRadians = Math.atan(height / base);
	let x;
	let y;

	if (rightIntersection) {
		angleInRadians = (Math.PI / 2) - angleInRadians;
		const dx = radius * Math.sin(angleInRadians);
		const dy = radius * Math.cos(angleInRadians);
		x = centerTargetX - dx;
		y = centerTargetY - dy;

		if (centerInterX > centerTargetX) {
			x = centerTargetX + dx;
			y = centerTargetY + dy;
		}
	} else {
		// for left intersection.
		const dx = radius * Math.cos(angleInRadians);
		const dy = radius * Math.sin(angleInRadians);
		x = centerInterX + dx;
		y = centerInterY + dy;	

		if (centerInterX > centerTargetX) {
			x = centerInterX - dx;
			y = centerInterY - dy;
		}
	}
	return { x, y };
}

function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode) {
	const { width: intersectionNodeWidth } = intersectionNode.measured;
	const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
	const targetPosition = targetNode.internals.positionAbsolute;

	const defaultRadius: number = 0;
	const radius = (intersectionNodeWidth ?? defaultRadius) / 2;
	const centerInterX = intersectionNodePosition.x + radius;
	const centerInterY = intersectionNodePosition.y + radius;
	const centerTargetX = targetPosition.x + radius;
	const centerTargetY = targetPosition.y + radius;

	const base = centerTargetX - centerInterX;
	const height = centerTargetY - centerInterY;

	const intersectionCalculation: IntersectionCalculation = {
		base,
		height,
		radius,
		centerInterX,
		centerInterY,
		centerTargetX,
		centerTargetY
	};

	return intersectionCalculation;
}

function decideScenario(intersectionCalculation: IntersectionCalculation) {
	if (intersectionCalculation.centerInterY < intersectionCalculation.centerTargetY ) {
		return {
			sourceIntersectionPoint: scenarioA(intersectionCalculation, false),
			targetIntersectionPoint: scenarioA(intersectionCalculation, true)
		};
	}

	return {
		sourceIntersectionPoint: scenarioB(intersectionCalculation, false),
		targetIntersectionPoint: scenarioB(intersectionCalculation, true)
	};
}

interface IntersectionPoint {
	x: number,
	y: number,
};

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: InternalNode, intersectionPoint: IntersectionPoint) {
	const n = { ...node.internals.positionAbsolute, ...node };
	const nx = Math.round(n.x);
	const ny = Math.round(n.y);
	const px = Math.round(intersectionPoint.x);
	const py = Math.round(intersectionPoint.y);

	if (px <= nx + 1) {
		return Position.Left;
	}
	if (px >= nx + n.measured.width - 1) {
		return Position.Right;
	}
	if (py <= ny + 1) {
		return Position.Top;
	}
	if (py >= n.y + n.measured.height - 1) {
		return Position.Bottom;
	}

	return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
	// Calculate the left intersection first. Diagram:
	// P: intersection point
	// (intersection node)P ----- > (target node)tersection first.

	const intersectionCalculation = getNodeIntersection(source, target);
	const { sourceIntersectionPoint, targetIntersectionPoint } = decideScenario(intersectionCalculation);

	const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
	const targetPos = getEdgePosition(target, targetIntersectionPoint);
	console.log(`sourceInter: ${sourceIntersectionPoint.x}, ${sourceIntersectionPoint.y}`);
	console.log(`targerInter: ${targetIntersectionPoint.x}, ${targetIntersectionPoint.y}`);

	return {
		sx: sourceIntersectionPoint.x,
		sy: sourceIntersectionPoint.y,
		tx: targetIntersectionPoint.x,
		ty: targetIntersectionPoint.y,
		sourcePos,
		targetPos,
	};
}

export function createNodesAndEdges() {
	const nodes = [];
	const edges = [];
	const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

	nodes.push({ id: 'target', data: { label: 'Target' }, position: center });

	for (let i = 0; i < 8; i++) {
		const degrees = i * (360 / 8);
		const radians = degrees * (Math.PI / 180);
		const x = 250 * Math.cos(radians) + center.x;
		const y = 250 * Math.sin(radians) + center.y;

		nodes.push({ id: `${i}`, data: { label: 'Source' }, position: { x, y } });

		edges.push({
			id: `edge-${i}`,
			target: 'target',
			source: `${i}`,
			type: 'floating',
			markerEnd: {
				type: MarkerType.Arrow,
			},
		});
	}

	return { nodes, edges };
}
