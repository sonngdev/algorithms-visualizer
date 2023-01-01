export class Node<T = any> {
  public distance: number = Infinity;
  public isVisited: boolean = false;
  public isWall: boolean = false;
  public previousNode: Node | null = null;
  public neighbors: Node<T>[] = [];

  constructor(
    public data: T
  ) {}

  reset(): void {
    this.distance = Infinity;
    this.isVisited = false;
    this.previousNode = null;
  }

  isNeighbor(node: Node): boolean {
    return this.neighbors.includes(node);
  }
}
