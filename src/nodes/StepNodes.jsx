import { Handle, Position } from "@xyflow/react";
import "./StepNode.css";

const statusLabels = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  approved: "Đã phê duyệt",
};

export default function StepNode({ data, selected }) {
  const status = data.status ?? "pending";

  return (
    <div className={`step-node ${selected ? "step-node--selected" : ""}`}>
      <Handle type="target" position={Position.Top} />

      <div className="step-node__title">{data.label}</div>

      <span className={`step-node__status step-node__status--${status}`}>
        {statusLabels[status] ?? status}
      </span>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
