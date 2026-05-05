Step 1: Start backend server
cd client
# Make sure .env is loaded (e.g. via npm run dev or by setting vars manually)
npm run dev
Step 2: Start Python Graphic Agents backend
cd Graphic-agents
# Activate virtual env if needed
venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
Step 3: Test in browser
Open your frontend (http://localhost:5173). Go to the 'Graphics AI' section.
When you click Generate, the frontend will call:
http://localhost:5173/api/design/generate-from-prompt which in turn calls:
http://localhost:8001/api/generate_from_prompt.
That’s all it takes.