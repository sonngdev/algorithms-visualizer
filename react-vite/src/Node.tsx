import { useEffect, useState } from 'react';
import { DragState } from './App';
import './Node.css';

export enum NodeType {
  START,
  END,
  MIDDLE,
};

type NodeProps = {
  row: number,
  col: number,
  type: NodeType,
  isVisited: boolean,
  isOnPath: boolean,
  dragState: DragState
  onDragStart: (nodeType: NodeType, row: number, col: number) => void,
  onDragEnter: (row: number, col: number) => void,
};

export default function Node({
  row,
  col,
  type,
  isOnPath,
  isVisited,
  dragState,
  onDragStart,
  onDragEnter,
}: NodeProps) {
  const [isUnderDrag, setIsUnderDrag] = useState(false);

  let className = "node";
  if (type === NodeType.START) {
    className += ' start';
  } else if (type === NodeType.END) {
    className += ' end';
  } else if (isOnPath) {
    className += ' on-path';
  } else if (isVisited) {
    className += ' visited';
  } else if (isUnderDrag) {
    if (dragState.nodeType === NodeType.START) {
      className += ' under-drag-start';
    } else if (dragState.nodeType === NodeType.END) {
      className += ' under-drag-end';
    }
  }

  const handleDragStart = () => {
    onDragStart(type, row, col);
  }

  const handleDragEnter = () => {
    onDragEnter(row, col);
    setIsUnderDrag(true);
  };

  const handleDragLeave = () => {
    setIsUnderDrag(false);
  };

  // Sometimes onDragLeave is not called, resulting in false nodes
  // being highlighted.
  useEffect(() => {
    if (!dragState.isActive) {
      setIsUnderDrag(false);
    }
  }, [dragState.isActive]);

  return (
    <div
      className={className}
      draggable={type === NodeType.START || type === NodeType.END}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    />
  )
}
