// src/pages/Prediction.tsx
import { useState } from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, Info } from 'lucide-react';
import { fetchInflationPrediction } from '../api';
import PredictionChart from '../components/charts/PredictionChart';
import { ErrorCard, LoadingCard } from '../components/ui';
import { formatDate } from '../utils/format';

const YEARS_OPTIONS = [1, 2, 3, 5, 7, 10];

export default function Prediction() {
  const [yearsAhead, setYearsAhead] = useState(3);

  const { data, isLoading, error, isFetching } = useQuery(
    ['prediction', yearsAhead],
    () => fetchInflationPrediction(yearsAhead),
    { staleTime: 10 * 60 * 1000 }
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Inflyatsiya Bashorati</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Tarixiy ma'lumotlar asosida kelajakdagi inflyatsiya foizini bashorat qilish.
          Model: Ensemble (Chiziqli Regressiya + Holt Eksponensial Silliqlash)
        </p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Bashorat davri
            </label>
            <div className="flex gap-2 flex-wrap">
              {YEARS_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYearsAhead(y)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    yearsAhead === y
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {y} yil
                </button>
              ))}
            </div>
          </div>
          {isFetching && !isLoading && (
            <div className="text-xs text-slate-400 animate-pulse">Yangilanmoqda...</div>
          )}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <LoadingCard rows={6} />
      ) : error ? (
        <ErrorCard message="Bashorat ma'lumotlarini yuklab bo'lmadi. Backend ishlamasligi yoki inflyatsiya ma'lumotlari mavjud emasligi mumkin." />
      ) : data ? (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-slate-900">
                Inflyatsiya ko'rsatkichi — tarixiy va bashorat
              </h2>
              <span className="text-xs text-slate-400">
                {data.predictions.length} ta bashorat nuqtasi
              </span>
            </div>
            <PredictionChart
              historical={data.historical}
              predictions={data.predictions}
              height={380}
            />
          </div>

          {/* Prediction table */}
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Bashorat jadvali</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400 uppercase">Davr</th>
                    <th className="text-right py-2 pr-4 text-xs font-medium text-slate-400 uppercase">Bashorat (%)</th>
                    <th className="text-right py-2 pr-4 text-xs font-medium text-slate-400 uppercase">Quyi (80%)</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-400 uppercase">Yuqori (80%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.predictions.map((p) => (
                    <tr key={p.date} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 pr-4 text-slate-600">{formatDate(p.date)}</td>
                      <td className="py-2.5 pr-4 text-right font-bold text-blue-700">{p.value.toFixed(1)}%</td>
                      <td className="py-2.5 pr-4 text-right text-slate-500">{p.lower.toFixed(1)}%</td>
                      <td className="py-2.5 text-right text-slate-500">{p.upper.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model info */}
          <div className="card bg-blue-50 border-blue-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-2">Model haqida</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(data.model_info).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs text-blue-500 uppercase">{key.replace(/_/g, ' ')}</div>
                      <div className="text-sm font-medium text-blue-900">
                        {typeof value === 'number' ? value.toFixed(3) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  ⚠️ Bashorat ma'lumotlari taxminiy bo'lib, iqtisodiy qarorlar uchun yagona asos bo'la olmaydi.
                  Mutaxassislar maslahatiga murojaat qiling.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
