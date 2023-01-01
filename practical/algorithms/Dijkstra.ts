import { Node } from '../data-structures/Node';

interface DijkstraResult<T> {
  shortestPath: Node<T>[];
  visitedNodes: Node<T>[];
}

interface DijkstraNodeData {
  row: number;
  col: number;
  distance: number;
  isVisited: boolean;
}

interface NodePosition {
  row: number;
  col: number;
}

export function createGridData(
  rows: number,
  cols: number,
  startNodePosition: NodePosition,
  endNodePosition: NodePosition,
  wallPositions: NodePosition[],
) {
  let grid: Node<DijkstraNodeData>[][] = [];
  let startNode: Node<DijkstraNodeData> | null = null;
  let endNode: Node<DijkstraNodeData> | null = null;

  for (let i = 0; i < rows; i++) {
    const row: Node<DijkstraNodeData>[] = [];
    for (let j = 0; j < cols; j++) {
      const node = new Node({
        row: i,
        col: j,
        distance: Infinity,
        isVisited: false,
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
    const { row , col } = wallPosition;
    grid[row][col].isWall = true;
  }

  return { grid, startNode, endNode };
}

export function performAlgorithm<T extends DijkstraNodeData>(
  grid: Node<T>[],
  originNode: Node<T>,
  destinationNode: Node<T>,
): DijkstraResult<T> {
  const shortestPath: Node<T>[] = [];
  const visitedNodes: Node<T>[] = [];

  for (let node of grid) {
    if (node === originNode) {
      node.data.distance = 0;
    } else if (node.isNeighbor(originNode)) {
      node.data.distance = 1;
    } else {
      node.data.distance = Infinity;
    }
    node.data.isVisited = false;
    node.previousNode = null;
  }

  const unvisitedNodes = grid.slice();

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort(
      (node1, node2) => node1.data.distance - node2.data.distance,
    );
    const closestNode = unvisitedNodes.shift();
    // If the closest node is infinitely far away,
    // it is no not connected to the current grid (graph)
    // and we should stop
    if (!closestNode || closestNode.data.distance === Infinity) {
      break;
    }
    if (closestNode.isWall) {
      continue;
    }

    closestNode.data.isVisited = true;
    visitedNodes.push(closestNode);
    if (closestNode === destinationNode) {
      break;
    }

    const unvisitedNeighbors = closestNode.neighbors.filter(
      (node) => !node.data.isVisited,
    );
    for (let neighbor of unvisitedNeighbors) {
      neighbor.data.distance = closestNode.data.distance + 1;
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
