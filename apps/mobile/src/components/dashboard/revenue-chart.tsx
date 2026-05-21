import type { RevenueTrendBucket } from "@sme/shared";
import { Text, View } from "react-native";
import Svg, { Line, Polyline, Rect } from "react-native-svg";

import { Card, CardTitle } from "@/components/ui/card";
import { chartColors } from "@/theme/tokens";

export function RevenueChart({
  data,
  title,
}: {
  data: RevenueTrendBucket[];
  title: string;
}) {
  if (!data.length) {
    return (
      <Card>
        <CardTitle>{title}</CardTitle>
        <Text className="mt-2 text-sm text-muted-foreground">No data</Text>
      </Card>
    );
  }

  const width = 320;
  const height = 140;
  const padding = 12;
  const max = Math.max(...data.map((d) => Number(d.revenue)), 1);
  const points = data
    .map((d, i) => {
      const x =
        padding +
        (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        (Number(d.revenue) / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
        />
        {[0.25, 0.5, 0.75].map((f) => (
          <Line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={height - padding - f * (height - padding * 2)}
            y2={height - padding - f * (height - padding * 2)}
            stroke={chartColors.grid}
            strokeWidth={1}
          />
        ))}
        <Polyline
          points={points}
          fill="none"
          stroke={chartColors.revenue}
          strokeWidth={2.5}
        />
      </Svg>
    </Card>
  );
}
