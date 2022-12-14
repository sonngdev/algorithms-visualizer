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
  return (
    <div className="node" />
  )
}
