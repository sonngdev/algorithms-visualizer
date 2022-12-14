import { Node } from '../data-structures/Node';

interface DijkstraResult {
  shortestPath: Node[];
  visitedNodes: Node[];
}

export default function performDijkstraAlgorithm(
  grid: Node[],
  originNode: Node,
  destinationNode: Node,
): DijkstraResult {
  const shortestPath: Node[] = [];
  const visitedNodes: Node[] = [];

  for (let node of grid) {
    node.distance = node === originNode ? 0 : Infinity;
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

  const unvisitedNodes = grid.slice()

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((node1, node2) => node1.distance - node2.distance);
    const closestNode = unvisitedNodes.shift();
    // If the closest node is infinitely far away,
    // it is no not connected to the current grid (graph)
    // and we should stop
    if (!closestNode || closestNode.distance === Infinity) {
      break;
    }

    closestNode.isVisited = true;
    visitedNodes.push(closestNode);
    if (closestNode === destinationNode) {
      break;
    }

    const unvisitedNeighbors = closestNode.neighbors.filter((node) => !node.isVisited);
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
    }
  }

  return { shortestPath, visitedNodes };
}
