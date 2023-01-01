export class Node<T = any> {
  public isWall: boolean = false;
  public previousNode: Node | null = null;
  public neighbors: Node<T>[] = [];

  constructor(
    public data: T
  ) {}

  isNeighbor(node: Node): boolean {
    return this.neighbors.includes(node);
  }
}
