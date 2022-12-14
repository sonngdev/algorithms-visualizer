import {
  AdaptableHeapPriorityQueue,
  Locator,
} from '../data-structures/PriorityQueue';
import { Graph, Vertex } from '../data-structures/Graph';

type PathsFromSource<T> = Map<Vertex<T>, number>;

export function getShortestPaths<VertexT>(
  graph: Graph<VertexT, number>,
  source: Vertex<VertexT>,
): PathsFromSource<VertexT> {
  // Stores shortest distance found so far (temporary optimal path)
  const shortestDistancesFromSource = new Map<Vertex<VertexT>, number>();
  // Stores actual shortest distance (final optimal path)
  const cloud = new Map<Vertex<VertexT>, number>();
  // Stores and dequeue the nearest vertex
  const queue = new AdaptableHeapPriorityQueue<Vertex<VertexT>>();
  // Stores vertices' locators (used in queue.update())
  const vertexLocators = new Map<Vertex<VertexT>, Locator>();

  for (const vertex of graph.getVerticesIterator()) {
    const distanceFromSource = vertex === source ? 0 : Infinity;
    shortestDistancesFromSource.set(vertex, distanceFromSource);
    const locator = queue.add(distanceFromSource, vertex);
    vertexLocators.set(vertex, locator);
  }

  while (!queue.isEmpty()) {
    // At the time of dequeuing, distance is already the shortest...(1)
    const [distSrcToNearestVtx, nearestVertex] =
      queue.dequeueHighestPriorityValue();
    cloud.set(nearestVertex, distSrcToNearestVtx);
    vertexLocators.delete(nearestVertex);

    for (let edge of graph.getIncidentEdgesIterator(nearestVertex)) {
      const neighborVertex = edge.getOppositeVertex(nearestVertex);
      if (!cloud.has(neighborVertex)) {
        const sdistSrcToNearestVtx =
          shortestDistancesFromSource.get(nearestVertex);
        const distNearestVtxToNeighborVtx = edge.getElement();
        const distSrcToNeighborVtx =
          sdistSrcToNearestVtx! + distNearestVtxToNeighborVtx;
        const sdistSrcToNeighborVtx =
          shortestDistancesFromSource.get(neighborVertex);

        if (distSrcToNeighborVtx < sdistSrcToNeighborVtx!) {
          shortestDistancesFromSource.set(neighborVertex, distSrcToNeighborVtx);
          // (1)...because the shortest distance is already calculated here
          queue.update(
            vertexLocators.get(neighborVertex)!,
            distSrcToNeighborVtx,
            neighborVertex,
          );
        }
      }
    }
  }

  return cloud;
}
