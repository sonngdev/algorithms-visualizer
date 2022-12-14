import { useMemo, useState } from 'react';
import './App.css'
import Node, { NodeType } from './Node';

type NodeState = {
  isVisited: boolean;
  isOnPath: boolean;
}

const NUM_ROWS = 20;
const NUM_COLS = 50;

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
          row.map((node, colIndex) => (
            <Node
              key={`node-${rowIndex}-${colIndex}`}
              type={NodeType.MIDDLE}
              isVisited={false}
              isOnPath={false}
            />
          ))
        ))}
      </div>
    </div>
  )
}

export default App
