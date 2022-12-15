import { useMemo, useState } from 'react';
import produce from 'immer';
import Node, { NodeType } from './Node';
import { Node as NodeDS } from '../../practical/data-structures/Node';
import performDijkstraAlgorithm from '../../practical/algorithms/Dijkstra';
import './App.css'

type NodeState = {
  isVisited: boolean;
  isOnPath: boolean;
}

type NodeData = {
  row: number;
  col: number;
}

const NUM_ROWS = 20;
const NUM_COLS = 50;
const START_NODE = { row: 9, col: 20 };
const END_NODE = { row: 9, col: 30 }

function App() {
  const initialNodeStates = useMemo(() => {
    const states: NodeState[][] = [];
    for (let i = 0; i < NUM_ROWS; i++) {
      const row: NodeState[] = [];
      for (let j = 0; j < NUM_COLS; j++) {
        row.push({ isVisited: false, isOnPath: false });
      }
      states.push(row);
    }
    return states;
  }, [NUM_ROWS, NUM_COLS]);
  const [nodeStates, setNodeStates] = useState(initialNodeStates);

  const findShortestPath = () => {
    setNodeStates(initialNodeStates);

    let grid: NodeDS<NodeData>[][] = [];
    let startNode: NodeDS<NodeData> | null = null;
    let endNode: NodeDS<NodeData> | null = null;

    for (let i = 0; i < NUM_ROWS; i++) {
      const row: NodeDS<NodeData>[] = [];
      for (let j = 0; j < NUM_COLS; j++) {
        const node = new NodeDS({ row: i, col: j });
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

        if (i === START_NODE.row && j === START_NODE.col) {
          startNode = node;
        } else if (i === END_NODE.row && j === END_NODE.col) {
          endNode = node;
        }
      }
      grid.push(row);
    }
    if (!startNode || !endNode) {
      return;
    }

    const { visitedNodes, shortestPath } = performDijkstraAlgorithm(grid.flat(), startNode, endNode);

    for (let i = 0; i < visitedNodes.length; i++) {
      setTimeout(() => {
        const { data: { row, col } } = visitedNodes[i];
        setNodeStates(produce((draft) => {
          draft[row][col].isVisited = true;
        }));
      }, i * 10);
    }

    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const { data: { row, col } } = shortestPath[i];
        setNodeStates(produce((draft) => {
          draft[row][col].isOnPath = true;
        }));
      }, (visitedNodes.length + i) * 10);
    }
  };

  return (
    <div className="App">
      <div className="grid" style={{ gridTemplateRows: `repeat(${NUM_ROWS}, 1fr)`, gridTemplateColumns: `repeat(${NUM_COLS}, 1fr)` }}>
        {nodeStates.map((row, rowIndex) => (
          row.map((node, colIndex) => {
            let type: NodeType;
            if (rowIndex === START_NODE.row && colIndex === START_NODE.col) {
              type = NodeType.START;
            } else if (rowIndex === END_NODE.row && colIndex === END_NODE.col) {
              type = NodeType.END;
            } else {
              type = NodeType.MIDDLE;
            }
            const { isVisited, isOnPath } = node;

            return (
              <Node
                key={`node-${rowIndex}-${colIndex}`}
                type={type}
                isVisited={isVisited}
                isOnPath={isOnPath}
              />
            )
          })
        ))}
      </div>

      <button
        type="button"
        className="action"
        onClick={findShortestPath}
      >
        Find shortest path
      </button>
    </div>
  )
}

export default App
