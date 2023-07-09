import { Node, NodeData } from '../data-structures/Node';
import { CreateGridDataFn, PathfindingAlgorithm, PerformAlgorithmFn } from './types';

interface DFSNodeData extends NodeData {
  isVisited: boolean;
}

export const createGridData: CreateGridDataFn<DFSNodeData> = (
  rows,
  cols,
  startNodePosition,
  endNodePosition,
  wallPositions,
) => {
  let grid: Node<DFSNodeData>[][] = [];
  let startNode: Node<DFSNodeData> | null = null;
  let endNode: Node<DFSNodeData> | null = null;

  for (let i = 0; i < rows; i++) {
    const row: Node<DFSNodeData>[] = [];
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

export const performAlgorithm: PerformAlgorithmFn<DFSNodeData> = (
  grid,
  originNode,
  destinationNode,
) => {
  const shortestPath: Node<DFSNodeData>[] = [];
  const visitedNodes: Node<DFSNodeData>[] = [];

  for (let node of grid) {
    node.data.isVisited = false;
    node.previousNode = null;
  }

  const stack: Node<DFSNodeData>[] = [originNode];
  let nodeRunner: Node<DFSNodeData>;

  while (stack.length > 0) {
    nodeRunner = stack.pop()!;

    // Still need to check here even though at the time of pushing
    // to the stack, we only push unvisited nodes, because by the
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
    stack.push(...unvisitedNeighbors);
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

const DFS: PathfindingAlgorithm<DFSNodeData> = {
  createGridData,
  performAlgorithm,
};

export default DFS;
