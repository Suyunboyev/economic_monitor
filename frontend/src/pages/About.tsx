// src/pages/About.tsx
import { Database, RefreshCw, TrendingUp, BarChart2, Globe, Shield } from 'lucide-react';

const features = [
  {
    icon: BarChart2,
    title: 'Real vaqt ko\'rsatkichlari',
    desc: 'Inflyatsiya, valyuta kursi, eksport va import ma\'lumotlari muntazam yangilanib turadi.',
    color: '#3b82f6',
  },
  {
    icon: TrendingUp,
    title: 'Bashorat modeli',
    desc: 'Ensemble (Linear Regression + Holt Exponential Smoothing) modeli yordamida kelajakdagi inflyatsiya bashorat qilinadi.',
    color: '#8b5cf6',
  },
  {
    icon: RefreshCw,
    title: 'Avtomatik yangilanish',
    desc: 'Ma\'lumotlar APScheduler yordamida avtomatik ravishda belgilangan vaqtlarda yangilanadi.',
    color: '#10b981',
  },
  {
    icon: Database,
    title: 'PostgreSQL bazasi',
    desc: 'Barcha tarixiy ma\'lumotlar PostgreSQL bazasida saqlandi va SQLAlchemy ORM orqali boshqariladi.',
    color: '#f59e0b',
  },
  {
    icon: Globe,
    title: 'REST API',
    desc: 'FastAPI asosida qurilgan zamonaviy REST API — Swagger UI hujjatlari mavjud.',
    color: '#ef4444',
  },
  {
    icon: Shield,
    title: 'Ishonchli ma\'lumot manbalari',
    desc: 'O\'zbekiston Statistika qo\'mitasi, Markaziy bank va boshqa rasmiy manbalar.',
    color: '#06b6d4',
  },
];

const stack = [
  { name: 'FastAPI', role: 'Backend framework', color: '#059669' },
  { name: 'SQLAlchemy', role: 'ORM', color: '#dc2626' },
  { name: 'PostgreSQL', role: 'Ma\'lumotlar bazasi', color: '#2563eb' },
  { name: 'APScheduler', role: 'Vazifalar rejalashtiruvchi', color: '#7c3aed' },
  { name: 'React', role: 'Frontend library', color: '#0ea5e9' },
  { name: 'TypeScript', role: 'Dasturlash tili', color: '#0369a1' },
  { name: 'Recharts', role: 'Grafik kutubxonasi', color: '#d97706' },
  { name: 'TailwindCSS', role: 'CSS framework', color: '#0891b2' },
];

const endpoints = [
  { method: 'GET', path: '/api/indicators', desc: 'Barcha ko\'rsatkichlar ro\'yxati' },
  { method: 'GET', path: '/api/indicator/{name}', desc: 'Vaqt qatori ma\'lumotlari' },
  { method: 'GET', path: '/api/latest', desc: 'Oxirgi qiymatlar' },
  { method: 'GET', path: '/api/predict/inflation', desc: 'Inflyatsiya bashorati' },
  { method: 'GET', path: '/health', desc: 'Tizim holati' },
  { method: 'POST', path: '/admin/refresh', desc: 'Qo\'lda ma\'lumot yangilash' },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🇺🇿</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          O'zbekiston Iqtisodiy Monitor
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Ushbu tizim O'zbekiston iqtisodiy ko'rsatkichlarini real vaqtda kuzatish,
          tahlil qilish va kelajakka bashorat qilish uchun mo'ljallangan.
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Imkoniyatlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Texnologiyalar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stack.map(({ name, role, color }) => (
            <div key={name} className="card py-4 text-center">
              <div
                className="text-sm font-bold mb-1"
                style={{ color }}
              >
                {name}
              </div>
              <div className="text-xs text-slate-400">{role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API endpoints */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-5">API Endpointlari</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Metod</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">URL</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Tavsif</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(({ method, path, desc }) => (
                <tr key={path} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className={`badge ${method === 'GET' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      {method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-700">{path}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Swagger UI: <a href="http://localhost:8000/docs" target="_blank" className="text-blue-600 hover:underline">http://localhost:8000/docs</a>
        </p>
      </div>

      {/* Data sources */}
      <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
        <h2 className="text-base font-bold mb-4">Ma'lumot manbalari</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            O'zbekiston Respublikasi Statistika agentligi (stat.uz)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            O'zbekiston Respublikasi Markaziy banki (cbu.uz)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            O'zbekiston Respublikasi Davlat soliq qo'mitasi
          </li>
        </ul>
      </div>
    </div>
  );
}
