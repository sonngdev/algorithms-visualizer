import { Node, NodeData } from '../data-structures/Node';
import { CreateGridDataFn, PathfindingAlgorithm, PerformAlgorithmFn } from './types';

interface DijkstraNodeData extends NodeData {
  distance: number;
  isVisited: boolean;
}

export const createGridData: CreateGridDataFn<DijkstraNodeData> = (
  rows,
  cols,
  startNodePosition,
  endNodePosition,
  wallPositions,
) => {
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

export const performAlgorithm: PerformAlgorithmFn<DijkstraNodeData> = (
  grid,
  originNode,
  destinationNode,
) => {
  const shortestPath: Node<DijkstraNodeData>[] = [];
  const visitedNodes: Node<DijkstraNodeData>[] = [];

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

const Dijkstra: PathfindingAlgorithm<DijkstraNodeData> = {
  createGridData,
  performAlgorithm,
};

export default Dijkstra;
