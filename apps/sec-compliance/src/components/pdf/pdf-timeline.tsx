import { Svg, Rect, Text, View } from "@react-pdf/renderer";

const COLORS = {
  filed_on_time: "#22c55e",
  filed_late: "#f59e0b",
  not_filed: "#A63232",
  not_required: "#e5e7eb",
};

type FilingStatus = "filed_on_time" | "filed_late" | "not_filed" | "not_required";

interface TimelineCell {
  year: number;
  reportType: "GIS" | "AFS" | "BO";
  status: FilingStatus;
}

interface PDFTimelineProps {
  cells: TimelineCell[];
  years: number[];
}

const CELL_W = 28;
const CELL_H = 18;
const ROW_LABEL_W = 30;
const HEADER_H = 18;
const ROW_TYPES = ["GIS", "AFS", "BO"] as const;

export function PDFTimeline({ cells, years }: PDFTimelineProps) {
  const svgWidth = ROW_LABEL_W + years.length * CELL_W;
  const svgHeight = HEADER_H + ROW_TYPES.length * CELL_H;

  // Build lookup: "GIS-2022" -> status
  const lookup: Record<string, FilingStatus> = {};
  for (const c of cells) {
    lookup[`${c.reportType}-${c.year}`] = c.status;
  }

  return (
    <View>
      <Svg width={svgWidth} height={svgHeight}>
        {/* Year column headers */}
        {years.map((year, xi) => (
          <Text
            key={`header-${year}`}
            x={ROW_LABEL_W + xi * CELL_W + CELL_W / 2}
            y={HEADER_H - 4}
            style={{
              fontSize: 6,
              textAnchor: "middle",
              fill: "#374151",
              fontFamily: "Helvetica",
            }}
          >
            {String(year)}
          </Text>
        ))}

        {/* Row labels and cells */}
        {ROW_TYPES.map((rtype, ri) => (
          <>
            {/* Row label */}
            <Text
              key={`label-${rtype}`}
              x={ROW_LABEL_W - 4}
              y={HEADER_H + ri * CELL_H + CELL_H / 2 + 3}
              style={{
                fontSize: 7,
                textAnchor: "end",
                fill: "#374151",
                fontFamily: "Helvetica-Bold",
              }}
            >
              {rtype}
            </Text>

            {/* Cells for this row */}
            {years.map((year, xi) => {
              const status: FilingStatus = lookup[`${rtype}-${year}`] ?? "not_required";
              const color = COLORS[status];
              const x = ROW_LABEL_W + xi * CELL_W;
              const y = HEADER_H + ri * CELL_H;
              return (
                <Rect
                  key={`cell-${rtype}-${year}`}
                  x={x + 1}
                  y={y + 1}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  rx={2}
                  ry={2}
                  fill={color}
                />
              );
            })}
          </>
        ))}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: "row", marginTop: 4, gap: 10 }}>
        {(
          [
            ["filed_on_time", "Filed on Time"],
            ["filed_late", "Filed Late"],
            ["not_filed", "Not Filed"],
            ["not_required", "Not Required"],
          ] as [FilingStatus, string][]
        ).map(([status, label]) => (
          <View key={status} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Svg width={10} height={10}>
              <Rect x={0} y={0} width={10} height={10} rx={2} ry={2} fill={COLORS[status]} />
            </Svg>
            <Text style={{ fontSize: 7, color: "#6b7280", fontFamily: "Helvetica" }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
