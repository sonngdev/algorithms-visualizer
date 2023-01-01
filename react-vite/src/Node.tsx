import { MouseEvent, useEffect, useState } from 'react';
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
  isWall: boolean,
  dragState: DragState
  onDragStart: (nodeType: NodeType, row: number, col: number) => void,
  onDragEnter: (row: number, col: number) => void,
  onClick: (row: number, col: number) => void,
  onMouseDown: (row: number, col: number) => void,
  onMouseEnter: (row: number, col: number) => void,
  onMouseUp: () => void,
};

export default function Node({
  row,
  col,
  type,
  isOnPath,
  isVisited,
  isWall,
  dragState,
  onDragStart,
  onDragEnter,
  onClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
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
  } else if (isWall) {
    className += ' wall';
  } else if (isUnderDrag) {
    if (dragState.nodeType === NodeType.START) {
      className += ' under-drag-start';
    } else if (dragState.nodeType === NodeType.END) {
      className += ' under-drag-end';
    }
  }

  //-------------Moving start/end nodes-------------//

  const handleDragStart = () => {
    onDragStart(type, row, col);
  }

  const handleDragEnter = () => {
    if (!isWall) {
      onDragEnter(row, col);
      setIsUnderDrag(true);
    }
  };

  const handleDragLeave = () => {
    setIsUnderDrag(false);
  };

  //-------------Creating walls-------------//

  // Click a node to toggle a wall
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (type === NodeType.MIDDLE && !event.shiftKey) {
      onClick(row, col);
    }
  };

  // Mouse down and drag to create walls quickly
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (type === NodeType.MIDDLE && event.shiftKey) {
      onMouseDown(row, col);
    }
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (type === NodeType.MIDDLE && event.shiftKey) {
      onMouseEnter(row, col);
    }
  }

  const handleMouseUp = (event: MouseEvent<HTMLDivElement>) => {
    if (event.shiftKey) {
      onMouseUp();
    }
  }

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
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
    />
  )
}
