export class Vertex<T = any> {
  constructor(private element: T) {}

  getElement() {
    return this.element;
  }
}

class Edge<T = any> {
  constructor(
    private origin: Vertex,
    private destination: Vertex,
    private element: T,
  ) {}

  getEndpoints(): [Vertex, Vertex] {
    return [this.origin, this.destination];
  }

  getOppositeVertex(vertex: Vertex) {
    if (vertex === this.origin) {
      return this.destination;
    }
    return this.origin;
  }

  getElement() {
    return this.element;
  }
}

export class Graph<VertexT, EdgeT> {
  // For example, given two vertices V1 and V2 connected by an edge E1,
  // `outGoingEdges` will look like this:
  // { V1 -> { V2 -> E1 } }
  private outgoingEdges: Map<Vertex<VertexT>, Map<Vertex<VertexT>, Edge<EdgeT>>>;
  private incomingEdges: Map<Vertex<VertexT>, Map<Vertex<VertexT>, Edge<EdgeT>>>;

  constructor(isDirected: boolean) {
    this.outgoingEdges = new Map();
    this.incomingEdges = isDirected ? new Map() : this.outgoingEdges;
  }

  isDirected() {
    return this.outgoingEdges !== this.incomingEdges;
  }

  getVertexCount() {
    return this.outgoingEdges.size;
  }

  getVerticesIterator() {
    return this.outgoingEdges.keys();
  }

  getEdgeCount() {
    let edgeCount = 0;
    for (let edges of this.outgoingEdges.values()) {
      edgeCount += edges.size;
    }
    return this.isDirected() ? edgeCount : Math.floor(edgeCount / 2);
  }

  getEdges() {
    const allEdges = new Set<Edge<EdgeT>>();
    for (let edges of this.outgoingEdges.values()) {
      for (let edge of edges.values()) {
        allEdges.add(edge);
      }
    }
    return Array.from(allEdges);
  }

  getEdge(sourceVertex: Vertex<VertexT>, destinationVertex: Vertex<VertexT>) {
    return this.outgoingEdges.get(sourceVertex)?.get(destinationVertex) ?? null;
  }

  getDegree(vertex: Vertex<VertexT>, outgoing = true) {
    const adjacentVertexMappings = outgoing
      ? this.outgoingEdges.get(vertex)
      : this.incomingEdges.get(vertex);
    return adjacentVertexMappings?.size ?? 0;
  }

  *getIncidentEdgesIterator(vertex: Vertex<VertexT>, outgoing = true) {
    const adjacentVertexMappings = outgoing
      ? this.outgoingEdges.get(vertex)
      : this.incomingEdges.get(vertex);
    if (!adjacentVertexMappings) {
      return;
    }
    for (let edge of adjacentVertexMappings.values()) {
      yield edge;
    }
  }

  insertVertex(element: VertexT) {
    const vertex = new Vertex(element);
    this.outgoingEdges.set(vertex, new Map<Vertex<VertexT>, Edge<EdgeT>>());
    if (this.isDirected()) {
      this.incomingEdges.set(vertex, new Map<Vertex<VertexT>, Edge<EdgeT>>());
    }
    return vertex;
  }

  insertEdge(originVertex: Vertex<VertexT>, destinationVertex: Vertex<VertexT>, element: EdgeT) {
    const edge = new Edge(originVertex, destinationVertex, element);
    this.outgoingEdges.get(originVertex)?.set(destinationVertex, edge);
    this.incomingEdges.get(destinationVertex)?.set(originVertex, edge);
  }
}
