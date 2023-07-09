import { DragEventHandler, useMemo, useRef, useState } from 'react';
import produce from 'immer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedinIn, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faHeart, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { isMobile } from 'react-device-detect';

import Node, { NodeType } from './components/Node';
import { calculateDefaultNodePositions, calculateGridDimension } from './utils/dimension';
import { Node as NodeDS, NodeData as NodeDSData } from './data-structures/Node';
import { PathfindingAlgorithm } from './algorithms/types';
import DFS from './algorithms/DFS';
import BFS from './algorithms/BFS';
import Dijkstra from './algorithms/Dijkstra';
import AStar from './algorithms/AStar';
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

const gridDimension = calculateGridDimension();
const NUM_ROWS = gridDimension.rows;
const NUM_COLS = gridDimension.cols;
const defaultPositions = calculateDefaultNodePositions(gridDimension);
const DEFAULT_START_NODE_POS = defaultPositions.start;
const DEFAULT_END_NODE_POS = defaultPositions.end;

function App() {
  const [startNodePos, setStartNodePos] = useState(DEFAULT_START_NODE_POS);
  const [endNodePos, setEndNodePos] = useState(DEFAULT_END_NODE_POS);
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
  const timeoutRef = useRef<number[]>([]);
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
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  };

  const resetNodeStates = () => {
    setNodeStates(initialNodeStates);
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  };

  const resetGrid = () => {
    setStartNodePos(DEFAULT_START_NODE_POS);
    setEndNodePos(DEFAULT_END_NODE_POS);
    setNodeStates(initialNodeStates);
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  };

  //-------------Visualizing pathfinding algorithm-------------//

  const getWallPositions = () => {
    const wallPositions = [];
    for (let i = 0; i < nodeStates.length; i++) {
      for (let j = 0; j < nodeStates[i].length; j++) {
        if (nodeStates[i][j].isWall) {
          wallPositions.push({ row: i, col: j });
        }
      }
    }
    return wallPositions;
  };

  const animateAlgorithm = (
    visitedNodes: NodeDS<NodeData>[],
    shortestPath: NodeDS<NodeData>[],
  ) => {
    for (let i = 0; i < visitedNodes.length; i++) {
      const timeout = setTimeout(() => {
        const {
          data: { row, col },
        } = visitedNodes[i];
        setNodeStates(
          produce((draft) => {
            draft[row][col].isVisited = true;
          }),
        );
      }, i * 5);
      timeoutRef.current.push(timeout);
    }

    for (let i = 0; i < shortestPath.length; i++) {
      const timeout = setTimeout(() => {
        const {
          data: { row, col },
        } = shortestPath[i];
        setNodeStates(
          produce((draft) => {
            draft[row][col].isOnPath = true;
          }),
        );
      }, (visitedNodes.length + i * 4) * 5); // Slow down shortest path animation by 4 times
      timeoutRef.current.push(timeout);
    }
  };

  const visualizeAlgorithm = <T extends NodeDSData>(algorithm: PathfindingAlgorithm<T>) => {
    clearVisualizedPath();

    const { grid, startNode, endNode } = algorithm.createGridData(
      NUM_ROWS,
      NUM_COLS,
      startNodePos,
      endNodePos,
      getWallPositions(),
    );
    if (!startNode || !endNode) {
      return;
    }

    const { visitedNodes, shortestPath } = algorithm.performAlgorithm(
      grid.flat(),
      startNode,
      endNode,
    );
    animateAlgorithm(visitedNodes, shortestPath);
  }

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
      <header className="title">
        <h1>Pathfinding Algorithms Visualizer</h1>
        <div className="mobile">
          Check out on <a href="https://github.com/thanhsonng/algorithm-visualizer" target="_blank" rel="noopener noreferrer">GitHub</a>
          <FontAwesomeIcon icon={faGithub} size="lg" className="icon" />
        </div>
        <div className="desktop">
          <a href="https://github.com/thanhsonng/algorithm-visualizer" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} size="xl" className="icon" />
          </a>
        </div>
      </header>

      <div className="main-grid">
        <h2>Grid</h2>
        <div className="legends">
          <div className="legend-group start">
            <div className="node start"></div>
            <span className="label">Start</span>
          </div>
          <div className="legend-group end">
            <div className="node end"></div>
            <span className="label">End</span>
          </div>
          <div className="legend-group">
            <div className="node"></div>
            <span className="label">Unvisited</span>
          </div>
          <div className="legend-group visited">
            <div className="node visited"></div>
            <span className="label">Visited</span>
          </div>
          <div className="legend-group on-path">
            <div className="node on-path"></div>
            <span className="label">Shortest</span>
          </div>
          <div className="legend-group wall">
            <div className="node wall"></div>
            <span className="label">Wall</span>
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
      </div>

      <div className="actions">
        <h2>Controls</h2>

        <div className="algorithms">
          <button
            type="button"
            className="action"
            onClick={() => visualizeAlgorithm(DFS)}
          >
            Depth-first Search
          </button>
          <button
            type="button"
            className="action"
            onClick={() => visualizeAlgorithm(BFS)}
          >
            Breadth-first Search
          </button>
          <button
            type="button"
            className="action"
            onClick={() => visualizeAlgorithm(Dijkstra)}
          >
            Dijkstra's Algorithm
          </button>
          <button
            type="button"
            className="action"
            onClick={() => visualizeAlgorithm(AStar)}
          >
            A* Algorithm
          </button>
        </div>

        <div className="cleanup-buttons">
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
          <button type="button" className="action minor" onClick={resetGrid}>
            Reset grid
          </button>
        </div>
      </div>

      <div className="tips">
        <h2>Tips</h2>
        {isMobile ? (
          <ul>
            <li>
              <div>
                View this site on desktop to see extra features.
              </div>
            </li>
            <li>
              <div>
                Tap on a white node to toggle a wall.
              </div>
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              <div>
                Try dragging the start/end nodes to new positions.
              </div>
            </li>
            <li>
              <div>
                Click on a white node and drag to create walls quickly.
              </div>
            </li>
            <li>
              <div>
                Hold <code>ctrl</code>/<code>cmd</code> and click on a white node to toggle a wall.
              </div>
            </li>
          </ul>
        )}
      </div>

      <footer>
        <div>Created with <FontAwesomeIcon icon={faHeart} className="icon" /> by Son Nguyen</div>
        <div className="contacts">
          <a href="https://www.sonng.dev/" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGlobe} size="lg" />
          </a>
          <a href="https://github.com/thanhsonng" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} size="xl" />
          </a>
          <a href="https://www.linkedin.com/in/thanhsonng/" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedinIn} size="xl" />
          </a>
          <a href="https://twitter.com/thanhsonng211" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} size="xl" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
