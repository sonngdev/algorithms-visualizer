import { DragEventHandler, useMemo, useState } from 'react';
import produce from 'immer';
import Node, { NodeType } from './Node';
import { Node as NodeDS } from '../../practical/data-structures/Node';
import performDijkstraAlgorithm from '../../practical/algorithms/Dijkstra';
import './App.css'

type NodeState = {
  isVisited: boolean;
  isOnPath: boolean;
  isWall: boolean;
}

type NodeData = {
  row: number;
  col: number;
}

export type DragState = {
  isActive: boolean;
  nodeType: NodeType | null;
  row: number;
  col: number;
}

const NUM_ROWS = 20;
const NUM_COLS = 35;

function App() {
  const [startNodePos, setStartNodePos] = useState({ row: 9, col: 12 });
  const [endNodePos, setEndNodePos] = useState({ row: 9, col: 22 });
  const initialNodeStates = useMemo(() => {
    const states: NodeState[][] = [];
    for (let i = 0; i < NUM_ROWS; i++) {
      const row: NodeState[] = [];
      for (let j = 0; j < NUM_COLS; j++) {
        row.push({ isVisited: false, isOnPath: false, isWall: false });
      }
      states.push(row);
    }
    return states;
  }, [NUM_ROWS, NUM_COLS]);
  const [nodeStates, setNodeStates] = useState(initialNodeStates);
  const [dragState, setDragState] = useState<DragState>({
    isActive: false,
    nodeType: null,
    row: 0,
    col: 0,
  });

  const clearVisualizedPath = () => {
    setNodeStates(produce((draft) => {
      for (let row of draft) {
        for (let nodeState of row) {
          nodeState.isVisited = false;
          nodeState.isOnPath = false;
        }
      }
    }))
  };

  const resetNodeStates = () => {
    setNodeStates(initialNodeStates);
  };

  const createGridData = () => {
    let grid: NodeDS<NodeData>[][] = [];
    let startNode: NodeDS<NodeData> | null = null;
    let endNode: NodeDS<NodeData> | null = null;

    for (let i = 0; i < NUM_ROWS; i++) {
      const row: NodeDS<NodeData>[] = [];
      for (let j = 0; j < NUM_COLS; j++) {
        const node = new NodeDS({ row: i, col: j });
        if (nodeStates[i][j].isWall) {
          node.isWall = true;
        }
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

        if (i === startNodePos.row && j === startNodePos.col) {
          startNode = node;
        } else if (i === endNodePos.row && j === endNodePos.col) {
          endNode = node;
        }
      }
      grid.push(row);
    }
    return { grid, startNode, endNode };
  }

  const animateAlgorithm = (visitedNodes: NodeDS<NodeData>[], shortestPath: NodeDS<NodeData>[]) => {
    for (let i = 0; i < visitedNodes.length; i++) {
      setTimeout(() => {
        const { data: { row, col } } = visitedNodes[i];
        setNodeStates(produce((draft) => {
          draft[row][col].isVisited = true;
        }));
      }, i * 5);
    }

    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const { data: { row, col } } = shortestPath[i];
        setNodeStates(produce((draft) => {
          draft[row][col].isOnPath = true;
        }));
      }, (visitedNodes.length + i * 4) * 5); // Slow down shortest path animation by 4 times
    }
  }

  const findShortestPath = () => {
    clearVisualizedPath();

    const { grid, startNode, endNode } = createGridData();
    if (!startNode || !endNode) {
      return;
    }

    const { visitedNodes, shortestPath } = performDijkstraAlgorithm(grid.flat(), startNode, endNode);
    animateAlgorithm(visitedNodes, shortestPath);
  };

  const handleDragStart = (nodeType: NodeType, row: number, col: number) => {
    clearVisualizedPath();
    setDragState({ isActive: true, nodeType, row, col });
  }

  const handleDragEnter = (row: number, col: number) => {
    setDragState({ ...dragState, row, col });
  };

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = () => {
    const { nodeType, row, col } = dragState;
    if (nodeType === NodeType.START) {
      setStartNodePos({ row: row, col: col });
    } else if (nodeType === NodeType.END) {
      setEndNodePos({ row: row, col: col });
    }
    setDragState({ isActive: false, nodeType: null, row: 0, col: 0 });
  };

  const handleNodeClick = (row: number, col: number) => {
    clearVisualizedPath();
    setNodeStates(produce((draft) => {
      draft[row][col].isWall = !draft[row][col].isWall;
    }));
  };

  return (
    <div className="App">
      <h1 className="title">Pathfinding Algorithms Visualizer</h1>

      <div className="main">
        <div className="legends">
          <div className="legend-group">
            <div className="node start"></div>
            <span className="label">Start node</span>
          </div>
          <div className="legend-group">
            <div className="node end"></div>
            <span className="label">End node</span>
          </div>
          <div className="legend-group">
            <div className="node"></div>
            <span className="label">Unvisited node</span>
          </div>
          <div className="legend-group">
            <div className="node visited"></div>
            <span className="label">Visited node</span>
          </div>
          <div className="legend-group">
            <div className="node on-path"></div>
            <span className="label">Shortest-path node</span>
          </div>
          <div className="legend-group">
            <div className="node wall"></div>
            <span className="label">Wall node</span>
          </div>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateRows: `repeat(${NUM_ROWS}, 1fr)`,
            gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)`,
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {nodeStates.map((row, rowIndex) => (
            row.map((nodeState, colIndex) => {
              let type: NodeType;
              if (rowIndex === startNodePos.row && colIndex === startNodePos.col) {
                type = NodeType.START;
              } else if (rowIndex === endNodePos.row && colIndex === endNodePos.col) {
                type = NodeType.END;
              } else {
                type = NodeType.MIDDLE;
              }
              const { isVisited, isOnPath, isWall } = nodeState;

              return (
                <Node
                  key={`node-${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  type={type}
                  isVisited={isVisited}
                  isOnPath={isOnPath}
                  isWall={isWall}
                  dragState={dragState}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onClick={handleNodeClick}
                />
              )
            })
          ))}
        </div>

        <div className="sidebar">
          <h2 className="subtitle">Visualize:</h2>
          <button
            type="button"
            className="action"
            onClick={findShortestPath}
          >
            Dijkstra's Algorithm
          </button>
          <button
            type="button"
            className="action clear"
            onClick={clearVisualizedPath}
          >
            Clear path
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
