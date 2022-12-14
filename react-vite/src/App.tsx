import { useMemo, useState } from 'react';
import './App.css'
import Node, { NodeType } from './Node';

type NodeState = {
  isVisited: boolean;
  isOnPath: boolean;
}

const NUM_ROWS = 20;
const NUM_COLS = 50;
const START_NODE = { row: 9, col: 10 };
const END_NODE = { row: 9, col: 40 }

function App() {
  const initialNodeStates = useMemo(() => {
    const states: NodeState[][] = [];
    for (let i = 0; i < NUM_ROWS; i++) {
      const row: NodeState[] = [];
      for (let j = 0; j < NUM_COLS; j++) {
        row.push({ isVisited: false, isOnPath: true });
      }
      states.push(row);
    }
    return states;
  }, [NUM_ROWS, NUM_COLS]);
  const [nodeStates, setNodeStates] = useState(initialNodeStates);

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

            return (
              <Node
                key={`node-${rowIndex}-${colIndex}`}
                type={type}
                isVisited={rowIndex === 3}
                isOnPath={colIndex === 5}
              />
            )
          })
        ))}
      </div>
    </div>
  )
}

export default App
