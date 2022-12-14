import './Node.css';

export enum NodeType {
  START,
  END,
  MIDDLE,
};

type NodeProps = {
  type: NodeType,
  isVisited: boolean,
  isOnPath: boolean,
};

export default function Node({ type, isOnPath, isVisited }: NodeProps) {
  let className = "node";
  if (type === NodeType.START) {
    className += ' start';
  } else if (type === NodeType.END) {
    className += ' end';
  } else if (isOnPath) {
    className += ' on-path';
  } else if (isVisited) {
    className += ' visited';
  }

  return (
    <div className={className} />
  )
}
