import { Node, NodeData } from '../data-structures/Node';
import { CreateGridDataFn, PathfindingAlgorithm, PerformAlgorithmFn } from './types';

interface BFSNodeData extends NodeData {
  isVisited: boolean;
}

export const createGridData: CreateGridDataFn<BFSNodeData> = (
  rows,
  cols,
  startNodePosition,
  endNodePosition,
  wallPositions,
) => {
  let grid: Node<BFSNodeData>[][] = [];
  let startNode: Node<BFSNodeData> | null = null;
  let endNode: Node<BFSNodeData> | null = null;

  for (let i = 0; i < rows; i++) {
    const row: Node<BFSNodeData>[] = [];
    for (let j = 0; j < cols; j++) {
      const node = new Node({
        row: i,
        col: j,
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
    const { row, col } = wallPosition;
    grid[row][col].isWall = true;
  }

  return { grid, startNode, endNode };
};

export const performAlgorithm: PerformAlgorithmFn<BFSNodeData> = (
  grid,
  originNode,
  destinationNode,
) => {
  const shortestPath: Node<BFSNodeData>[] = [];
  const visitedNodes: Node<BFSNodeData>[] = [];

  for (let node of grid) {
    node.data.isVisited = false;
    node.previousNode = null;
  }

  const queue: Node<BFSNodeData>[] = [originNode];
  let nodeRunner: Node<BFSNodeData>;

  while (queue.length > 0) {
    nodeRunner = queue.shift()!;

    // Still need to check here even though at the time of enqueuing
    // to the queue, we only enqueue unvisited nodes, because by the
    // time we get back to it, it can be already visited from a
    // different node.
    if (nodeRunner.data.isVisited) {
      continue;
    }

    nodeRunner.data.isVisited = true;
    visitedNodes.push(nodeRunner);

    if (nodeRunner === destinationNode) {
      break;
    }

    const unvisitedNeighbors = nodeRunner.neighbors.filter(
      (node) => !node.data.isVisited && !node.isWall
    );
    for (let neighbor of unvisitedNeighbors) {
      neighbor.previousNode = nodeRunner;
    }
    queue.push(...unvisitedNeighbors);
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

  // console.log(visitedNodes);
  return { shortestPath, visitedNodes };
};

const BFS: PathfindingAlgorithm<BFSNodeData> = {
  createGridData,
  performAlgorithm,
};

export default BFS;
