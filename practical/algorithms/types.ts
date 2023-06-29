import { Node, NodeData } from "../data-structures/Node";

export interface NodePosition {
  row: number;
  col: number;
}

export interface GridData<T extends NodeData> {
  grid: Node<T>[][],
  startNode: Node<T> | null,
  endNode: Node<T> | null,
}

export interface PathfindingResult<T extends NodeData> {
  shortestPath: Node<T>[];
  visitedNodes: Node<T>[];
}

export type CreateGridDataFn<T extends NodeData> = (
  rows: number,
  cols: number,
  startNodePosition: NodePosition,
  endNodePosition: NodePosition,
  wallPositions: NodePosition[],
) => GridData<T>;

export type PerformAlgorithmFn<T extends NodeData> = (
  grid: Node<T>[],
  startNode: Node<T>,
  endNode: Node<T>,
) => PathfindingResult<T>

export interface PathfindingAlgorithm<T extends NodeData> {
  createGridData: CreateGridDataFn<T>,
  performAlgorithm: PerformAlgorithmFn<T>,
}
