backend:
cd backend/venv/scripts/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

frontend:
npm run dev
