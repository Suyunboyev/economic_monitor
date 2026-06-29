// src/components/charts/LineChart.tsx
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatShortDate } from '../../utils/format';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  referenceLine?: number;
  referenceLabel?: string;
}

function CustomTooltip({ active, payload, label, unit }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3">
      <div className="text-xs text-slate-500 mb-1">{label ? formatShortDate(label) : ''}</div>
      <div className="text-lg font-bold text-slate-900">
        {payload[0].value.toFixed(2)}
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export default function LineChart({
  data,
  color = '#3b82f6',
  unit,
  height = 300,
  showGrid = true,
  showDots = false,
  referenceLine,
  referenceLabel,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={(d) => {
            const date = new Date(d);
            return date.toLocaleDateString('uz-UZ', { year: '2-digit', month: 'short' });
          }}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          width={45}
          tickFormatter={(v) => `${v.toFixed(0)}${unit === '%' ? '%' : ''}`}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        {referenceLine !== undefined && (
          <ReferenceLine
            y={referenceLine}
            stroke="#94a3b8"
            strokeDasharray="4 2"
            label={{ value: referenceLabel || '', fill: '#94a3b8', fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={showDots ? { r: 3, fill: color, strokeWidth: 0 } : false}
          activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: 'white' }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
