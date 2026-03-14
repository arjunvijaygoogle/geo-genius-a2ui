import json
import logging
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ADK Imports
from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner
from google.adk.tools import google_maps_grounding
from google.genai import types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

A2UI_INSTRUCTION = """
You are a routing and travel assistant. You MUST use the google_maps_grounding tool to estimate the best route, locations, and travel times based on the user's query.

CRITICAL: You must NOT reply in plain text. Your entire response MUST be a valid A2UI JSON array describing the UI components to render. 
Follow the A2UI v0.9 specification. Use components like "Card", "Text", and "Map".

Example Output Format:
[
  {
    "type": "surfaceUpdate",
    "surfaceId": "main",
    "components": [
      {
        "component": "Card",
        "id": "result-card",
        "children": [
          { "component": "Text", "text": "I found the best route for your trip." },
          { "component": "Map", "location": { "lat": 48.8584, "lng": 2.2945 } }
        ]
      }
    ]
  }
]
"""

# 1. Define the Agent
routing_agent = Agent(
    name="routing_agent",
    model="gemini-2.5-pro",
    description="Estimates travel routes and formats them as A2UI JSON.",
    instruction=A2UI_INSTRUCTION,
    tools=[google_maps_grounding],
)

# 2. Wrap the Agent in a Runner
# The Runner acts as the engine that executes tasks and manages conversation sessions
runner = InMemoryRunner(
    agent=routing_agent,
    app_name="a2ui_maps_app"
)

class ChatRequest(BaseModel):
    prompt: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        logger.info(f"Received query: {request.prompt}")
        
        # 3. Create a unique session for the user execution
        session = await runner.session_service.create_session(
            app_name="a2ui_maps_app",
            user_id="web_user"
        )
        
        # 4. Format the input string into a standard ADK/GenAI Content object
        content = types.Content(
            role="user",
            parts=[types.Part.from_text(text=request.prompt)]
        )
        
        # 5. Execute the runner and collect the output
        raw_output = ""
        for event in runner.run(
            user_id="web_user",
            session_id=session.id,
            new_message=content
        ):
            # The agent might yield tool calls or other events; we only want the text parts
            if hasattr(event, "content") and event.content and hasattr(event.content, "parts"):
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        raw_output += part.text

        # 6. Clean the markdown if the LLM wraps the JSON
        raw_output = raw_output.strip()
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3].strip()
            
        a2ui_payload = json.loads(raw_output)
        return {"a2ui": a2ui_payload}
        
    except json.JSONDecodeError as e:
        logger.error(f"Agent failed to return valid JSON. Raw output: {raw_output}")
        raise HTTPException(status_code=500, detail="Agent did not return a valid A2UI JSON payload.")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)