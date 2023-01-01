import { Node } from '../data-structures/Node';

interface DijkstraResult<T> {
  shortestPath: Node<T>[];
  visitedNodes: Node<T>[];
}

interface DijkstraNodeData {
  row: number;
  col: number;
}

interface NodePosition {
  row: number;
  col: number;
}

type NodeState = {
  isVisited: boolean;
  isOnPath: boolean;
  isWall: boolean;
};

export function createGridData(
  rows: number,
  cols: number,
  nodeStates: NodeState[][],
  startNodePos: NodePosition,
  endNodePos: NodePosition,
) {
  let grid: Node<DijkstraNodeData>[][] = [];
  let startNode: Node<DijkstraNodeData> | null = null;
  let endNode: Node<DijkstraNodeData> | null = null;

  for (let i = 0; i < rows; i++) {
    const row: Node<DijkstraNodeData>[] = [];
    for (let j = 0; j < cols; j++) {
      const node = new Node({ row: i, col: j });
      if (nodeStates[i][j].isWall) {
        node.isWall = true;
      }
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

      if (i === startNodePos.row && j === startNodePos.col) {
        startNode = node;
      } else if (i === endNodePos.row && j === endNodePos.col) {
        endNode = node;
      }
    }
    grid.push(row);
  }
  return { grid, startNode, endNode };
}

export function performAlgorithm<T = any>(
  grid: Node<T>[],
  originNode: Node<T>,
  destinationNode: Node<T>,
): DijkstraResult<T> {
  const shortestPath: Node<T>[] = [];
  const visitedNodes: Node<T>[] = [];

  for (let node of grid) {
    if (node === originNode) {
      node.distance = 0;
    } else if (node.isNeighbor(originNode)) {
      node.distance = 1;
    } else {
      node.distance = Infinity;
    }
    node.isVisited = false;
    node.previousNode = null;
  }

  const unvisitedNodes = grid.slice();

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((node1, node2) => node1.distance - node2.distance);
    const closestNode = unvisitedNodes.shift();
    // If the closest node is infinitely far away,
    // it is no not connected to the current grid (graph)
    // and we should stop
    if (!closestNode || closestNode.distance === Infinity) {
      break;
    }
    if (closestNode.isWall) {
      continue;
    }

    closestNode.isVisited = true;
    visitedNodes.push(closestNode);
    if (closestNode === destinationNode) {
      break;
    }

    const unvisitedNeighbors = closestNode.neighbors.filter(
      (node) => !node.isVisited,
    );
    for (let neighbor of unvisitedNeighbors) {
      neighbor.distance = closestNode.distance + 1;
      neighbor.previousNode = closestNode;
    }
  }

  let shortestPathRunner = destinationNode;
  while (shortestPathRunner !== originNode) {
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

const Dijkstra = {
  createGridData,
  performAlgorithm,
};

export default Dijkstra;
