import { InternalNode } from '@xyflow/react';

interface IntersectionCalculation {
	base: number,
	height: number,
	radius: number,
	centerInterX: number,
	centerInterY: number,
	centerTargetX: number,
	centerTargetY: number
};

// Padding represents the scalar value to increase the distance between the intersection point and the node. 
// Scalar value is multiplied by the change in distance dx or dy.
// dx represents the change in x-coordinate of the intersection point from the center of the node.
// dy represents the change in y-coordinate of the intersection point from the center of the node.
const padding: number = 0.3;

function scenarioA({ base, height, radius, centerInterX, centerInterY, centerTargetX, centerTargetY }: IntersectionCalculation, rightIntersection: boolean) {
	// We assume the point is on the left side (intersection point) of the target node.
	let angleInRadians = Math.atan(base / height);
	let x;
	let y;

	if (rightIntersection) {
		angleInRadians = (Math.PI / 2) - angleInRadians;
		const dx = radius * Math.cos(angleInRadians);
		const dy = radius * Math.sin(angleInRadians);
		x = centerTargetX - dx - (padding * dx);
		y = centerTargetY - dy - (padding * dy);
	} else {
		// For left intersection.
		const dx = radius * Math.sin(angleInRadians);
		const dy = radius * Math.cos(angleInRadians);
		x = centerInterX + dx + (padding * dx);
		y = centerInterY + dy + (padding * dy);
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
		x = centerTargetX - dx - (padding * dx);
		y = centerTargetY - dy - (padding * dy);

		if (centerInterX > centerTargetX) {
			x = centerTargetX + dx + (padding * dx);
			y = centerTargetY + dy + (padding * dy);
		}
	} else {
		// for left intersection.
		const dx = radius * Math.cos(angleInRadians);
		const dy = radius * Math.sin(angleInRadians);
		x = centerInterX + dx + (padding * dx);
		y = centerInterY + dy + (padding * dy);	

		if (centerInterX > centerTargetX) {
			x = centerInterX - dx - (padding * dx);
			y = centerInterY - dy - (padding * dy);
		}
	}
	return { x, y };
}

function getIntersectionInfo(intersectionNode: InternalNode, targetNode: InternalNode) {
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


// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
	const intersectionCalculation = getIntersectionInfo(source, target);
	const { sourceIntersectionPoint, targetIntersectionPoint } = decideScenario(intersectionCalculation);

	return {
		sx: sourceIntersectionPoint.x,
		sy: sourceIntersectionPoint.y,
		tx: targetIntersectionPoint.x,
		ty: targetIntersectionPoint.y,
	};
}
