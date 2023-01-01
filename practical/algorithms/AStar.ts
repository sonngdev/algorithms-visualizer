import { Node } from '../data-structures/Node';

interface AStarResult<T> {
  shortestPath: Node<T>[];
  visitedNodes: Node<T>[];
}

interface AStarData {
  row: number;
  col: number;
  fScore: number; // Total cost
  gScore: number; // Cost to traverse from start node to this node
  hScore: number; // Heuristic (estimated cost from this node to end node)
}

function calculateHeuristic<T extends AStarData>(
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
export default function performAStarAlgorithm<T extends AStarData>(
  grid: Node<T>[],
  startNode: Node<T>,
  endNode: Node<T>,
): AStarResult<T> {
  const shortestPath: Node<T>[] = [];
  const visitedNodes: Node<T>[] = [];

  for (let node of grid) {
    if (node === startNode) {
      node.data.gScore = 0;
      node.data.fScore = calculateHeuristic(node, endNode);
    } else {
      node.data.gScore = Infinity;
      node.data.fScore = Infinity;
    }
    node.isVisited = false;
    node.previousNode = null;
  }

  const openSet: Node<T>[] = [];

  while (openSet.length > 0) {
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
        neighbor.data.hScore = tentativeGScore + calculateHeuristic(neighbor, endNode);
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
