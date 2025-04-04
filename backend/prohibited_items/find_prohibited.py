import json
import time
import google.generativeai as genai
from rapidfuzz import process, fuzz  # Faster fuzzy matching
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Load JSON file
json_path = os.path.join(os.path.dirname(__file__), "logistics_data.json")
with open(json_path, "r", encoding='utf-8') as f:
    logistics_data = json.load(f)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  # Replace with actual key

# Extract item names from the dataset
item_names = list(logistics_data.keys())

# Function to retrieve relevant items using **fuzzy matching only**
def retrieve_relevant_items(query, top_n=10):
    """Retrieve the most relevant items using fuzzy matching (no direct lookup)."""
    matches = process.extract(query.lower(), item_names, scorer=fuzz.partial_ratio, limit=top_n)
    return [match[0] for match in matches if match[1] > 30]  # Keep only high-confidence matches

# Function to query Gemini
def ask_gemini(user_query):
    start_time = time.time()  # Start timing

    # Check if API key is available
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("⚠️ Gemini API key not found or not valid")
        return {"prohibited_in": [], "restricted_in": []}

    try:
        # Retrieve relevant items using RAG (always fuzzy matching)
        relevant_items = retrieve_relevant_items(user_query, top_n=10)

        if not relevant_items:
            return {"prohibited_in": [], "restricted_in": []}

        # Extract only necessary fields **(reduce token size)**
        extracted_data = {
            item: {
                "prohibited_in": [entry["iso_code"] for entry in logistics_data[item]["prohibited_in"]],
                "restricted_in": [entry["iso_code"] for entry in logistics_data[item]["restricted_in"]],
                "summary": logistics_data[item]["notes"][:250] if logistics_data[item]["notes"] else "No additional regulatory notes available."
            }
            for item in relevant_items
        }

        # Convert to compact JSON **(avoid token overflow)**
        relevant_text = json.dumps(extracted_data, indent=None)[:1500]
        PROMPT_EXAMPLE="{prohibited_in: ['IN'], restricted_in: ['CN']}"
        # Optimized prompt (shorter & more structured)
        prompt = f"""
        A user wants trade regulation details on: **{user_query}**

        Using the provided data, return:
        - **Prohibited countries** (ISO2 codes)
        - **Restricted countries** (ISO2 codes)

        **Relevant Data:**
        {relevant_text}

        **Output must be in structured JSON format 
        like this:{PROMPT_EXAMPLE}**

        *No markdown, just plaintext*
        """

        # Use **Gemini-1.5-flash** (Fastest model)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        end_time = time.time()  # End timing
        print(f"✅ Execution Time: {end_time - start_time:.2f} seconds")  # Monitor speed

        return response.text  # Return structured JSON response
    except Exception as e:
        print(f"❌ Error in ask_gemini: {e}")
        return {"prohibited_in": [], "restricted_in": []}
