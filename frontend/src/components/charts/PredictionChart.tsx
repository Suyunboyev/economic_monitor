// src/components/charts/PredictionChart.tsx
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface HistoricalPoint {
  date: string;
  value: number;
}

interface PredictionPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
  model: string;
}

interface PredictionChartProps {
  historical: HistoricalPoint[];
  predictions: PredictionPoint[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 min-w-36">
      <div className="text-xs text-slate-500 mb-2">{label}</div>
      {payload.map((p) => (
        p.name && p.value !== undefined && (
          <div key={p.name} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}:</span>
            <span className="font-semibold text-slate-900">{p.value?.toFixed(1)}%</span>
          </div>
        )
      ))}
    </div>
  );
}

export default function PredictionChart({ historical, predictions, height = 380 }: PredictionChartProps) {
  // Combine all data
  const histData = historical.map(d => ({
    date: d.date.slice(0, 7),
    historical: d.value,
  }));

  const predData = predictions.map(d => ({
    date: d.date.slice(0, 7),
    predicted: d.value,
    confidence: [d.lower, d.upper],
    lower: d.lower,
    upper: d.upper,
  }));

  // Merge: last historical point = first prediction point for smooth line
  const lastHist = histData[histData.length - 1];
  const combined = [
    ...histData,
    ...predData.map(d => ({
      ...d,
      historical: d.date === lastHist?.date ? lastHist.historical : undefined,
    })),
  ];

  const dividerDate = lastHist?.date;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={combined} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          width={42}
          tickFormatter={(v) => `${v.toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />

        {/* Confidence band */}
        <Area
          dataKey="upper"
          name=""
          fill="#3b82f6"
          fillOpacity={0.08}
          stroke="none"
        />
        <Area
          dataKey="lower"
          name="80% ishonch oralig'i"
          fill="#ffffff"
          fillOpacity={1}
          stroke="#3b82f6"
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {/* Historical line */}
        <Line
          type="monotone"
          dataKey="historical"
          name="Tarixiy"
          stroke="#0f172a"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls={false}
        />

        {/* Prediction line */}
        <Line
          type="monotone"
          dataKey="predicted"
          name="Bashorat"
          stroke="#3b82f6"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }}
          activeDot={{ r: 5 }}
          connectNulls={false}
        />

        {/* Divider */}
        {dividerDate && (
          <ReferenceLine
            x={dividerDate}
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            label={{ value: "Hozir", position: 'insideTopRight', fill: '#94a3b8', fontSize: 11 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
