import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import { useCallback, useRef, useState, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { addEdge } from "@xyflow/react";
import StepNode from "./nodes/StepNodes.jsx";
import {
  mapNodes,
  mapEdges,
  mapNodesToDto,
  mapEdgesToDto,
} from "./mappers/workflowMapper";
const nodeTypes = {
  step: StepNode,
};

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  // 3. Quản lý Node và Edge bằng React state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nextNodeId = useRef(5);
  //Xử lý khi người dùng kết nối hai Node
  const onConnect = useCallback(
    (connection) => {
      console.log("Connection:", connection);
      setEdges((currentEdges) => {
        const updatedEdges = addEdge(connection, currentEdges);

        console.log("Updated Edges:", updatedEdges);

        return updatedEdges;
      });
    },
    [setEdges],
  );
  // Xử lý khi nhấn nút Thêm bước

  const addStep = () => {
    const id = nextNodeId.current++;
    const label = `Bước mới ${id}`;

    const sttNode =
      Math.max(0, ...nodes.map((node) => Number(node.data.dto?.sttNode ?? 0))) +
      1;

    // Dữ liệu nghiệp vụ giả lập cho Node mới
    const newNodeDto = {
      quyTrinhNodeID: id,
      sttNode,
      moTaNode: label,
      loaiChuyenTiepAsInt: 0,
      soNgayDinhMuc: 0,
      nhanSuID: null,
      quyTrinhID: 1001,
      loaiNodeAsInt: 0,
      donViID: null,
      toBoMonID: null,
      loaiPhanCongXLAsInt: 0,
      hanMucPhanCong: 0,
    };

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id: String(id),
        type: "step",
        position: { x: 500, y: sttNode * 150 },
        data: {
          label,
          status: "pending",
          dto: newNodeDto,
        },
      },
    ]);
  };

  const handleClick = (event, node) => {
    setSelectedItem({ kind: "node", id: node.id });
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedItem({ kind: "edge", id: edge.id });
  };

  const selectedNode =
    selectedItem?.kind === "node"
      ? nodes.find((node) => node.id === selectedItem.id)
      : null;
  const selectedEdge =
    selectedItem?.kind === "edge"
      ? edges.find((edge) => edge.id === selectedItem.id)
      : null;

  const handleLabelChange = (event) => {
    if (!selectedNode) return;

    const newLabel = event.target.value;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            }
          : node,
      ),
    );
  };

  const handleDelete = useCallback(
    ({ nodes: deletedNodes, edges: deletedEdges }) => {
      setSelectedItem((current) => {
        if (!current) return null;

        const wasDeleted =
          current.kind === "node"
            ? deletedNodes.some((n) => n.id === current.id)
            : deletedEdges.some((e) => e.id === current.id);

        return wasDeleted ? null : current;
      });
    },
    [],
  );

  const handlePreviewPayload = () => {
    try {
      const payload = {
        nodes: mapNodesToDto(nodes),
        edges: mapEdgesToDto(edges),
      };

      console.log("Payload gửi Backend:", payload);
    } catch (error) {
      console.error("Mapping failed:", error);
    }
  };

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await fetch("/workflow.json");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const workflow = await response.json();

        // Chuyển DTO thành dữ liệu React Flow
        const mappedNodes = mapNodes(workflow.nodes);
        const mappedEdges = mapEdges(workflow.edges);

        // Cập nhật React state
        setNodes(mappedNodes);
        setEdges(mappedEdges);
        setSelectedItem(null);

        // Cập nhật ID tiếp theo để tránh trùng
        const maxId = Math.max(
          0,
          ...workflow.nodes.map((dto) => dto.quyTrinhNodeID),
        );

        nextNodeId.current = maxId + 1;

        console.log("Workflow loaded:", workflow);
      } catch (error) {
        if (!cancelled) {
          console.error("Load workflow failed:", error);
        }
      }
    };

    loadWorkflow();
  }, [setNodes, setEdges]);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      {/* Canvas bên trái */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: "relative",
        }}
      >
        <button
          onClick={handlePreviewPayload}
          style={{
            position: "absolute",
            top: 16,
            left: 150,
            zIndex: 10,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Preview DTO
        </button>
        <button
          onClick={addStep}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          + Thêm bước
        </button>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={() => setSelectedItem(null)}
          onDelete={handleDelete}
          deleteKeyCode="Backspace"
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      {/* Panel bên phải */}
      <aside
        style={{
          width: 300,
          padding: 20,
          borderLeft: "1px solid #ddd",
          background: "#f8fafc",
          color: "#1e293b",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <h3>Chi tiết Workflow</h3>

        {selectedNode ? (
          <div>
            <p>ID: {selectedNode.id}</p>

            <label htmlFor="node-label">Tên bước xử lý</label>

            <input
              id="node-label"
              type="text"
              value={selectedNode.data.label}
              onChange={handleLabelChange}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 8,
                boxSizing: "border-box",
              }}
            />

            <p>Trạng thái: {selectedNode.data.status ?? "Không áp dụng"}</p>
          </div>
        ) : selectedEdge ? (
          <div>
            <h4>Thông tin Edge</h4>
            <p>ID: {selectedEdge.id}</p>
            <p>Source: {selectedEdge.source}</p>
            <p>Target: {selectedEdge.target}</p>
          </div>
        ) : (
          <p>Click vào Node hoặc Edge để xem thông tin.</p>
        )}

        {(selectedNode || selectedEdge) && (
          <p style={{ color: "#64748b" }}>
            Chọn Node/Edge trên canvas rồi nhấn Backspace để xóa.
          </p>
        )}
      </aside>
    </div>
  );
}
