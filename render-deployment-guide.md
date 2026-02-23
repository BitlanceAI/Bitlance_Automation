# Render Deployment Guide (Without Docker)

This guide explains how to deploy the **Node.js Server (Backend + Frontend)** and the **Python FastAPI Service (AI-Agents)** directly to Render.com using Native Web Services, without any `Dockerfile` or `render.yaml`.

---

## 🟢 Part 1: Deploying the Node.js Server (Backend + Client)

Since the `server` acts as the primary API and also serves the built `client` React app, we will deploy the `server` folder as a **Node Web Service**.

### Step 1.1: Prepare the Codebase for Render
We need to ensure the server automatically installs client dependencies and builds the React app during Render's build process.

1. **Open `server/package.json`** and add these `scripts`:
```json
"scripts": {
  "start": "node src/index.js",
  "build": "npm install --prefix ../client && npm run build --prefix ../client"
}
```

### Step 1.2: Create the Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New+** -> **Web Service**.
2. Connect your GitHub repository containing the project.
3. Configure the service settings:
   - **Name:** `automation-backend` (or similar)
   - **Root Directory:** `server` *(Important: This tells Render to run from the server folder)*
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Choose your Instance Type (Free or Starter).

### Step 1.3: Add Environment Variables
Scroll down to **Environment Variables** and add all variables from your `server/.env` file. 
**Crucial overrides for production:**
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `PYTHON_API_URL`: *(Leave blank for now, you will update this in Part 2)*
- `API_BASE_URL`: The `.onrender.com` URL Render assigned to this service (or leave it out if your React app uses relative paths in production).

5. Click **Deploy Web Service**. Render will install backend modules, install frontend modules, build the frontend, and start the Express server.

---

## 🔵 Part 2: Deploying the Python AI-Agents Service

We will deploy the `Ai-agents` folder as a separate **Python Web Service**.

### Step 2.1: Prepare the Codebase for Render
Render needs to know how to install requirements and start Uvicorn.

1. **Check `Ai-agents/requirements.txt`**. Ensure it includes:
```txt
fastapi
uvicorn
python-dotenv
requests
pydantic
```
2. *(Optional but recommended)* You can specify the Python version by adding a `.python-version` file inside the `Ai-agents` folder containing `3.11.x`.

### Step 2.2: Create the Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New+** -> **Web Service**.
2. Connect the same GitHub repository.
3. Configure the service settings:
   - **Name:** `automation-ai-service`
   - **Root Directory:** `Ai-agents` *(Important)*
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000` *(Render routes traffic to port 10000 by default for Python, but usually you just use `$PORT`)*
     > **Better Start Command:** `gunicorn app.main:app -k uvicorn.workers.UvicornWorker`

### Step 2.3: Add Environment Variables
Scroll down to **Environment Variables** and add everything from `Ai-agents/.env`:
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- *(Add any other keys used for generation)*

**Crucial Note on Google Credentials:**
Since you cannot upload a `service-account.json` file directly to Render, you must encode the file content into an environment variable. 
1. Add to Render Env Variables:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: *(Paste the entire raw JSON string of your service account here)*
2. In your Python code (where you initialize GCP services), change how you load credentials to read from `os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")` and parse it via `json.loads` instead of reading from a file.

4. Click **Deploy Web Service**.

---

## 🔗 Part 3: Linking the Services

Once the Python service is deployed and live, it will have a URL like `https://automation-ai-service.onrender.com`.

1. Go back to your **Node.js Web Service** on Render.
2. Go to the **Environment** tab.
3. Update the `PYTHON_API_URL` variable to point to the live Python service:
   - Key: `PYTHON_API_URL` 
   - Value: `https://automation-ai-service.onrender.com`
4. Save Changes. Render will automatically redeploy the Node.js server to pick up the new environment variable.

## Execution Complete 🎉
Your Express backend will now handle the frontend and database logic, and it will route AI Generation hits to your Render-hosted Python microservice.
