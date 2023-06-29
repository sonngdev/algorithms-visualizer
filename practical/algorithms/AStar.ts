import { Node, NodeData } from '../data-structures/Node';
import { CreateGridDataFn, PathfindingAlgorithm, PerformAlgorithmFn } from './types';

interface AStarNodeData extends NodeData {
  fScore: number; // Total cost
  gScore: number; // Cost to traverse from start node to this node
  hScore: number; // Heuristic (estimated cost from this node to end node)
}

export const createGridData: CreateGridDataFn<AStarNodeData> = (
  rows,
  cols,
  startNodePosition,
  endNodePosition,
  wallPositions,
) => {
  let grid: Node<AStarNodeData>[][] = [];
  let startNode: Node<AStarNodeData> | null = null;
  let endNode: Node<AStarNodeData> | null = null;

  for (let i = 0; i < rows; i++) {
    const row: Node<AStarNodeData>[] = [];
    for (let j = 0; j < cols; j++) {
      const node = new Node({
        row: i,
        col: j,
        fScore: Infinity,
        gScore: Infinity,
        hScore: Infinity,
      });
      if (j > 0) {
        const leftNode = row[j - 1];
        node.neighbors.push(leftNode);
        leftNode.neighbors.push(node);
      }
      if (i > 0) {
        const topNode = grid[i - 1][j];
        node.neighbors.push(topNode);
        topNode.neighbors.push(node);
      }

      row.push(node);

      if (i === startNodePosition.row && j === startNodePosition.col) {
        startNode = node;
      } else if (i === endNodePosition.row && j === endNodePosition.col) {
        endNode = node;
      }
    }
    grid.push(row);
  }

  for (let wallPosition of wallPositions) {
    const { row, col } = wallPosition;
    grid[row][col].isWall = true;
  }

  return { grid, startNode, endNode };
}

export function calculateHeuristic<T extends AStarNodeData>(
  node: Node<T>,
  endNode: Node<T>,
): number {
  // For now, don't allow a node to move diagonally
  return (
    Math.abs(node.data.row - endNode.data.row) +
    Math.abs(node.data.col - endNode.data.col)
  );
}

/**
 * Pseudo code: https://en.wikipedia.org/wiki/A*_search_algorithm
 */
export const performAlgorithm: PerformAlgorithmFn<AStarNodeData> = (
  grid,
  startNode,
  endNode,
) => {
  const shortestPath: Node<AStarNodeData>[] = [];
  const visitedNodes: Node<AStarNodeData>[] = [];

  for (let node of grid) {
    node.data.gScore = node === startNode ? 0 : Infinity;
    node.data.hScore = calculateHeuristic(node, endNode);
    node.data.fScore = node.data.gScore + node.data.hScore;
    node.previousNode = null;
  }

  const openSet: Node<AStarNodeData>[] = [startNode];

  while (openSet.length > 0) {
    // debugger;
    openSet.sort((node1, node2) => node1.data.fScore - node2.data.fScore);
    const currentNode = openSet.shift();
    if (!currentNode) {
      break;
    }
    if (currentNode.isWall) {
      continue;
    }

    visitedNodes.push(currentNode);
    if (currentNode === endNode) {
      break;
    }
    for (let neighbor of currentNode.neighbors) {
      let tentativeGScore = currentNode.data.gScore + 1;
      // Find a new best path to a neighbor, record it
      if (tentativeGScore < neighbor.data.gScore) {
        neighbor.previousNode = currentNode;
        neighbor.data.gScore = tentativeGScore;
        neighbor.data.fScore = tentativeGScore + neighbor.data.hScore;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  let shortestPathRunner = endNode;
  while (shortestPathRunner !== startNode) {
    shortestPath.unshift(shortestPathRunner);
    if (shortestPathRunner.previousNode) {
      shortestPathRunner = shortestPathRunner.previousNode;
    } else {
      // Can't backtrace to originNode, there is no shortest path
      break;
    }
  }

  return { shortestPath, visitedNodes };
}

const AStar: PathfindingAlgorithm<AStarNodeData> = {
  createGridData,
  performAlgorithm,
};

export default AStar;
