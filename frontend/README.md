# O'zbekiston Iqtisodiy Monitor — Frontend

React.js asosida qurilgan frontend qismi.

## Texnologiyalar

- **React 18** — UI kutubxonasi
- **TypeScript** — Tip xavfsizligi
- **Vite** — Build vositasi
- **TailwindCSS** — Styling
- **React Query** — Server state boshqaruvi
- **Recharts** — Grafik komponentlari
- **React Router** — SPA routing
- **Axios** — HTTP so'rovlar

## O'rnatish

```bash
cd frontend
npm install
```

## Ishga tushirish

```bash
# Development rejimi
npm run dev

# Build
npm run build
```

## Muhit o'zgaruvchilari

`.env` fayl yarating:

```env
VITE_API_URL=http://localhost:8000
```

## Papka tuzilishi

```
src/
├── api/           # API so'rovlar
├── components/
│   ├── charts/    # Grafik komponentlar
│   ├── layout/    # Navbar, Footer, Layout
│   └── ui/        # Umumiy UI komponentlar
├── pages/         # Sahifalar
│   ├── Dashboard.tsx      # Bosh sahifa
│   ├── IndicatorDetail.tsx # Ko'rsatkich tafsiloti
│   ├── Prediction.tsx     # Bashorat sahifasi
│   └── About.tsx          # Haqida
├── types/         # TypeScript tiplari
└── utils/         # Yordamchi funksiyalar
```

## API Manzillari

Backend `http://localhost:8000` da ishlashi kerak. Vite proxy orqali `/api` yo'llari backendga yo'naltiriladi.
