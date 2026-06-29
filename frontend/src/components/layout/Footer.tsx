// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇺🇿</span>
            <div>
              <div className="text-sm font-semibold text-slate-900">O'zbekiston Iqtisodiy Monitor</div>
              <div className="text-xs text-slate-500">Real vaqtda iqtisodiy ko'rsatkichlar</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center">
            Ma'lumotlar manbalari: O'zbekiston Statistika qo'mitasi, Markaziy bank, Davlat soliq qo'mitasi
          </div>
          <div className="text-xs text-slate-400">
            {new Date().getFullYear()} · FastAPI + React
          </div>
        </div>
      </div>
    </footer>
  );
}
