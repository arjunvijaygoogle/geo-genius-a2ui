# 🌍 A2Geo: Agentic UI Mapping Assistant 📍

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=appveyor) 
![Language](https://img.shields.io/badge/language-Python_|_React-yellow?style=for-the-badge&logo=javascript) 
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

---

## 🚀 Introduction

Welcome to **A2Geo**! 🗺️ This project is a cutting-edge Generative UI application demonstrating the power of Agent-to-UI (A2UI) interaction. 

Instead of writing hard-coded, rigid screens, **A2Geo** leverages the Google GenAI `gemini-2.5-pro` model combined with the powerful `google_maps_grounding` tool to intelligently compose entire user interfaces dynamically based on user prompts. Whether you ask for "coffee shops in Pune" or "hotels near the Eiffel Tower", A2Geo's underlying intelligent agent determines the locations and instructs the React frontend to natively render interactive map components, cards, and text! ✨

---

## 🛠️ Setting up the repository

Let's get your local environment running! 🏃‍♂️ The application is split into two robust parts: a **Python FastAPI Backend** and a **React + Vite Frontend**.

### 1️⃣ Prerequisites
- **Python 3.10+** 🐍
- **Node.js 18+** 📦
- A valid `GOOGLE_API_KEY` for the AI and Maps capabilities. 🔑

### 2️⃣ Backend Setup
Navigate to the backend directory and fire up the python server:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Set your API key in the environment
export GOOGLE_API_KEY="your-api-key-here"

# Run the backend
python server.py
# The server will start on http://localhost:8000 🚀
```

### 3️⃣ Frontend Setup
In a new terminal window, launch the React application:
```bash
cd frontend
npm install

# Run the Vite development server
npm run dev
# The frontend will start on http://localhost:5173 🎉
```

Now open your browser, enter your dream destination into the search bar, and watch the UI magically generate! 🤯

---

## 🎨 Modify for a new use case

Want to build an AI agent for a completely different purpose? A2Geo makes it simple to adapt to new domains! 💡

### Step 1: Update the Agent Instructions (Backend)
Open `backend/server.py` and modify the agent's core instructions to fit your specific use-case. For example, instead of a routing assistant, you can instruct it to act as a financial dashboard agent:

```python
A2UI_INSTRUCTION = """
You are a financial advisor agent. 
Respond in A2UI JSON format with "Card", "Chart", or "StockTicker" components based on the user's market queries.
...
"""
```

### Step 2: Register New UI Components (Frontend)
Open `frontend/src/App.jsx` and map the new component types the agent can generate to real React components in the `componentRegistry`:

```jsx
const componentRegistry = {
  Card: CardWidget,
  Text: TextWidget,
  Map: MapWidget,
  Chart: YourNewChartComponent,       // 👈 Add your shiny new React component!
  StockTicker: YourStockTickerWidget  // 👈 And another one!
};
```

Boom! 💥 You just created a custom Generative UI Agent dashboard from scratch!

---

## 💎 Industry Value

A2Geo highlights a massive paradigm shift in UI/UX Engineering: **Generative UI (GenUI)**. 🧠💻

* **Dynamic Adaptability**: UIs are no longer limited to the layouts conceived during rigid design off-sites. The app actively builds screens tailor-made for each specific customer intent in real-time. 🦎
* **Faster TTM (Time-To-Market)**: Drastically reduce frontend development cycles by treating UI elements as mere modular "widgets" that the AI composes based on its agentic logic. ⏱️
* **Deep Personalization**: Deliver 1:1 experiences instead of generic, one-size-fits-all templates. Provide the user exactly what they want to see, and absolutely nothing more. 🎯
* **Agentic Ecosystems**: Combines reasoning (`gemini-2.5-pro`), tool-usage (`google_maps_grounding`), and execution (`React JS`) to seamlessly produce actual, action-driven interfaces. 🤖🔥

---

## 🤝 Contribution

We love open source contributions! Want to drop in a new A2UI component snippet or enhance the core agent's logic? Here's how to pitch in: 💖

1. **Fork** the repository using the button at the top right 🍴
2. **Clone** it locally: `git clone https://github.com/your-username/A2Geo.git` 📥
3. **Create a branch**: `git checkout -b feature/awesome-new-component` 🌿
4. **Commit** your changes: `git commit -m 'Added an awesome new component'` 📝
5. **Push** to the branch: `git push origin feature/awesome-new-component` 🚀
6. Open a **Pull Request** and let's review it together! 👀✨

---
*Built with ❤️ by AI and UI enthusiasts everywhere. 🌎*
