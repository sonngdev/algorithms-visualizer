import { DragEventHandler, useMemo, useState } from 'react';
import produce from 'immer';
import Node, { NodeType } from './Node';
import { Node as NodeDS } from '../../practical/data-structures/Node';
import Dijkstra from '../../practical/algorithms/Dijkstra';
import AStar from '../../practical/algorithms/AStar';
import './App.css';

type NodeState = {
  isVisited: boolean;
  isOnPath: boolean;
  isWall: boolean;
};

type NodeData = {
  row: number;
  col: number;
};

export type DragState = {
  isActive: boolean;
  nodeType: NodeType | null;
  row: number;
  col: number;
};

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
  const [isCreatingWall, setIsCreatingWall] = useState(false);

  //-------------Helpers-------------//

  const clearVisualizedPath = () => {
    setNodeStates(
      produce((draft) => {
        for (let row of draft) {
          for (let nodeState of row) {
            nodeState.isVisited = false;
            nodeState.isOnPath = false;
          }
        }
      }),
    );
  };

  const resetNodeStates = () => {
    setNodeStates(initialNodeStates);
  };

  //-------------Visualizing pathfinding algorithm-------------//

  const animateAlgorithm = (
    visitedNodes: NodeDS<NodeData>[],
    shortestPath: NodeDS<NodeData>[],
  ) => {
    for (let i = 0; i < visitedNodes.length; i++) {
      setTimeout(() => {
        const {
          data: { row, col },
        } = visitedNodes[i];
        setNodeStates(
          produce((draft) => {
            draft[row][col].isVisited = true;
          }),
        );
      }, i * 5);
    }

    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const {
          data: { row, col },
        } = shortestPath[i];
        setNodeStates(
          produce((draft) => {
            draft[row][col].isOnPath = true;
          }),
        );
      }, (visitedNodes.length + i * 4) * 5); // Slow down shortest path animation by 4 times
    }
  };

  const visualizeDijkstra = () => {
    clearVisualizedPath();

    const { grid, startNode, endNode } = Dijkstra.createGridData(
      NUM_ROWS,
      NUM_COLS,
      nodeStates,
      startNodePos,
      endNodePos,
    );
    if (!startNode || !endNode) {
      return;
    }

    const { visitedNodes, shortestPath } = Dijkstra.performAlgorithm(
      grid.flat(),
      startNode,
      endNode,
    );
    animateAlgorithm(visitedNodes, shortestPath);
  };

  const visualizeAStar = () => {
    clearVisualizedPath();

    const { grid, startNode, endNode } = AStar.createGridData(
      NUM_ROWS,
      NUM_COLS,
      nodeStates,
      startNodePos,
      endNodePos,
    );
    if (!startNode || !endNode) {
      return;
    }

    const { visitedNodes, shortestPath } = AStar.performAlgorithm(
      grid.flat(),
      startNode,
      endNode,
    );
    animateAlgorithm(visitedNodes, shortestPath);
  };

  //-------------Moving start/end nodes-------------//

  const handleDragStart = (nodeType: NodeType, row: number, col: number) => {
    clearVisualizedPath();
    setDragState({ isActive: true, nodeType, row, col });
  };

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

  //-------------Creating walls-------------//

  const handleNodeClick = (row: number, col: number) => {
    clearVisualizedPath();
    setNodeStates(
      produce((draft) => {
        draft[row][col].isWall = !draft[row][col].isWall;
      }),
    );
  };

  const handleNodeMouseDown = (row: number, col: number) => {
    clearVisualizedPath();
    setIsCreatingWall(true);
    setNodeStates(
      produce((draft) => {
        draft[row][col].isWall = true;
      }),
    );
  };

  const handleNodeMouseEnter = (row: number, col: number) => {
    if (isCreatingWall) {
      setNodeStates(
        produce((draft) => {
          draft[row][col].isWall = true;
        }),
      );
    }
  };

  const handleNodeMouseUp = () => {
    setIsCreatingWall(false);
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
          {nodeStates.map((row, rowIndex) =>
            row.map((nodeState, colIndex) => {
              let type: NodeType;
              if (
                rowIndex === startNodePos.row &&
                colIndex === startNodePos.col
              ) {
                type = NodeType.START;
              } else if (
                rowIndex === endNodePos.row &&
                colIndex === endNodePos.col
              ) {
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
                  onMouseDown={handleNodeMouseDown}
                  onMouseEnter={handleNodeMouseEnter}
                  onMouseUp={handleNodeMouseUp}
                />
              );
            }),
          )}
        </div>

        <div className="tips">
          <h2 className="subtitle">💡 Tips:</h2>
          <ul>
            <li>Use desktop with a mouse for the best experience</li>
            <li>Try dragging the start/end node to a new position</li>
            <li>Click on a node to toggle a wall</li>
            <li>
              Hold Shift and left mouse at the same time to create walls quickly
            </li>
          </ul>
        </div>

        <div className="sidebar">
          <h2 className="subtitle">Visualize:</h2>
          <button type="button" className="action" onClick={visualizeDijkstra}>
            Dijkstra's Algorithm
          </button>
          <button type="button" className="action" onClick={visualizeAStar}>
            A* Algorithm
          </button>
          <button
            type="button"
            className="action minor"
            onClick={clearVisualizedPath}
          >
            Clear path
          </button>
          <button
            type="button"
            className="action minor"
            onClick={resetNodeStates}
          >
            Clear walls
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
