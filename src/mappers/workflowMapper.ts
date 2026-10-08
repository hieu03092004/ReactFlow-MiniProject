import type { Node, Edge } from "@xyflow/react";

import type { QuyTrinhNodeDto } from "../dtos/QuyTrinhNodeDto";
import type { QuyTrinhEdgeDto } from "../dtos/QuyTrinhEdgeDto";

// Backend DTO -> React Flow Node[]
export function mapNodes(dtoNodes: QuyTrinhNodeDto[]): Node[] {
  return [...dtoNodes]
    .sort((a, b) => a.sttNode - b.sttNode)
    .map((dto, index) => ({
      id: String(dto.quyTrinhNodeID),
      type: "step",
      position: {
        x: 250,
        y: index * 150,
      },
      data: {
        label: dto.moTaNode,
        status: "pending",
        dto: dto,
      },
    }));
}

// Backend DTO -> React Flow Edge[]
export function mapEdges(dtoEdges: QuyTrinhEdgeDto[]): Edge[] {
  return dtoEdges.map((dto) => ({
    id: String(dto.quyTrinhEdgeID),
    source: String(dto.fromQuyTrinhNodeID),
    target: String(dto.toQuyTrinhNodeID),
    data: {
      dto: dto,
    },
  }));
}

export function mapNodesToDto(nodes: Node[]): QuyTrinhNodeDto[] {
  return nodes.map((node) => {
    const originalDto: QuyTrinhNodeDto = node.data.dto as QuyTrinhNodeDto;
    return {
      ...originalDto,
      moTaNode: String(node.data.label ?? ""),
    };
  });
}

// React Flow Edge[] -> Backend DTO[]
export function mapEdgesToDto(edges: Edge[]): QuyTrinhEdgeDto[] {
  return edges.map((edge) => {
    const source = Number(edge.source);
    const target = Number(edge.target);

    const originalDto = edge.data?.dto as QuyTrinhEdgeDto | undefined;

    return {
      quyTrinhEdgeID: originalDto?.quyTrinhEdgeID ?? 0,
      fromQuyTrinhNodeID: source,
      toQuyTrinhNodeID: target,
    };
  });
}
