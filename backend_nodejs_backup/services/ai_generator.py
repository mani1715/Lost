#!/usr/bin/env python3
"""AI Service using Emergent Integrations Library"""
import asyncio
import sys
import json
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage

async def generate_description(prompt_data):
    """Generate property description using GPT-4.1"""
    try:
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY", "sk-emergent-d73Ba3fF034DcD4FeF"),
            session_id=f"property-desc-{os.getpid()}",
            system_message="You are a professional real estate copywriter. Write compelling, attractive property descriptions that highlight key features and appeal to potential renters. Keep descriptions around 150 words."
        )
        chat.with_model("openai", "gpt-4.1")
        
        prompt = f"""Write an attractive property description for:
Title: {prompt_data.get('title', 'Property')}
Type: {prompt_data.get('type', 'rental')}
Location: {prompt_data.get('location', 'N/A')}
Price: {prompt_data.get('price', 'N/A')}
Facilities: {prompt_data.get('facilities', 'Basic amenities')}"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"success": True, "description": response}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            prompt_data = json.loads(sys.argv[1])
            result = asyncio.run(generate_description(prompt_data))
            print(json.dumps(result))
        except json.JSONDecodeError as e:
            print(json.dumps({"success": False, "error": f"Invalid JSON: {e}"}))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
    else:
        print(json.dumps({"success": False, "error": "No prompt data provided"}))
