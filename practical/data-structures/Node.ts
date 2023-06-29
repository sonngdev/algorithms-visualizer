export interface NodeData {
  row: number;
  col: number;
}

export class Node<T extends NodeData> {
  public isWall: boolean = false;
  public previousNode: Node<T> | null = null;
  public neighbors: Node<T>[] = [];

  constructor(
    public data: T
  ) {}

  isNeighbor(node: Node<T>): boolean {
    return this.neighbors.includes(node);
  }
}
