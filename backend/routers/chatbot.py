from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from database import get_db
from auth import get_optional_user
import datetime

router = APIRouter(prefix="/api/chat", tags=["EcoBot Chatbot"])

# ─── Topic-based knowledge base ──────────────────────────────────────────────

ECOBOT_KNOWLEDGE = {
    # Emission Factors
    "electricity": {
        "keywords": ["electricity", "kwh", "kilowatt", "power", "grid", "energy", "appliance", "led", "solar"],
        "response": """⚡ **Electricity & Carbon Emissions**

**India Grid Emission Factor:** ~0.82 kg CO₂e per kWh (CEA 2023 baseline)

**Quick Impact Reference:**
- 100W bulb × 8h/day × 30 days = **24 kWh → ~19.7 kg CO₂e/month**
- Replace with 9W LED: saves **~17.5 kg CO₂e/month** (90% reduction!)
- 1.5 Ton AC running 8h/day × 30 days ≈ **360 kWh → ~295 kg CO₂e/month**

**Top Electricity Saving Tips:**
1. Switch to LED bulbs — 10x more efficient
2. Enable power-saver mode on electronics
3. Unplug vampire loads (chargers, TVs on standby): saves **~6.2 kg CO₂e/month**
4. Set AC to 24°C or higher: saves **~14 kg CO₂e/month**
5. Consider rooftop solar — 1kW panel avoids **~820 kg CO₂e/year**"""
    },
    "transportation": {
        "keywords": ["car", "bus", "metro", "bike", "transport", "commute", "vehicle", "drive", "petrol", "diesel", "flight", "travel", "km", "mile"],
        "response": """🚗 **Transportation Carbon Footprint**

**Emission Factors (per km):**
- Petrol Car (avg): **0.17 kg CO₂e/km**
- Diesel Car: **0.16 kg CO₂e/km**
- Motorcycle: **0.10 kg CO₂e/km**
- City Bus: **0.089 kg CO₂e/km**
- Metro/Rail: **0.041 kg CO₂e/km**
- Domestic Flight: **0.255 kg CO₂e/km**
- Electric Car: **0.053 kg CO₂e/km** (India grid)

**Example:** 30km daily petrol car commute = **153.9 kg CO₂e/month**
Same trip by metro = only **37.1 kg CO₂e/month** → saves **116.8 kg/month!**

**Green Transport Tips:**
1. Switch to metro/bus for ≥2 stops → biggest single impact
2. Carpool: halves individual emissions instantly
3. Work from home 2 days/week: cuts commute emissions 40%
4. Consider an e-bike for <10km trips"""
    },
    "fuel": {
        "keywords": ["lpg", "cng", "kerosene", "coal", "wood", "fuel", "cooking", "gas", "stove", "biomass"],
        "response": """🔥 **Fuel & Heating Emissions**

**Emission Factors:**
- LPG (cooking gas): **2.98 kg CO₂e/kg** (14.2kg cylinder ≈ **42.3 kg CO₂e**)
- CNG (compressed natural gas): **2.21 kg CO₂e/kg**
- Kerosene: **2.52 kg CO₂e/litre**
- Coal/charcoal: **2.42 kg CO₂e/kg**
- Firewood/biomass: **1.66 kg CO₂e/kg** (land-use adjusted)

**Typical Monthly Impact:**
- Average Indian household uses ~1 LPG cylinder/month → **~42 kg CO₂e**
- Switch to induction cooking (if using clean grid electricity): reduces to ~**24 kg CO₂e/month**

**Reduction Strategies:**
1. Pressure cookers reduce cooking time by 70% → less gas
2. Solar cookers: zero emissions for daytime cooking
3. Biogas digesters convert organic waste to clean cooking fuel"""
    },
    "waste": {
        "keywords": ["waste", "garbage", "recycle", "compost", "plastic", "landfill", "trash", "bin", "organic", "food waste"],
        "response": """♻️ **Waste & Recycling Emissions**

**Emission Factors:**
- General waste to landfill: **0.52 kg CO₂e/kg**
- Organic food waste (methane from landfill): **1.3 kg CO₂e/kg**
- Plastic recycled vs landfilled: saves **~1.5 kg CO₂e/kg**
- Paper recycled: saves **~1.0 kg CO₂e/kg**

**Average Urban Indian:**
- Generates ~0.45 kg solid waste/day → **~7 kg CO₂e/month from waste alone**

**High-Impact Waste Actions:**
1. **Compost food scraps** → prevents methane (21x stronger than CO₂!)
2. **Dry-wet waste segregation** enables proper recycling
3. Refuse single-use plastics; carry a cloth bag
4. Buy in bulk to reduce packaging
5. Repair electronics before replacing (embodied carbon savings are huge)"""
    },
    "carbon_footprint": {
        "keywords": ["carbon footprint", "footprint", "co2", "emissions", "greenhouse", "ghg", "climate", "calculate", "measure"],
        "response": """🌍 **Understanding Your Carbon Footprint**

**What is it?**
Your carbon footprint is the total greenhouse gases (CO₂, CH₄, N₂O, etc.) released by your activities, expressed in **kg CO₂ equivalent (CO₂e)**.

**Average Benchmarks:**
- Global average: ~4,700 kg CO₂e/year (~392 kg/month)
- Indian average: ~1,900 kg CO₂e/year (~158 kg/month)
- Sustainable target: <2,000 kg CO₂e/year (Paris Agreement)
- UK average: ~5,500 kg CO₂e/year

**Your 4 Main Sources:**
1. 🔌 **Electricity** – powering your home/office
2. 🚗 **Transportation** – how you move around
3. 🔥 **Fuel** – cooking, heating, direct combustion
4. 🗑️ **Waste** – what you throw away

**Use the Carbon Calculator** in the left menu to measure your personal footprint and get personalized recommendations!"""
    },
    "recommendations": {
        "keywords": ["reduce", "save", "tip", "improve", "lower", "better", "suggest", "recommend", "action", "help", "how to"],
        "response": """💡 **Top Carbon Reduction Strategies**

**Highest Impact Actions (ranked by CO₂e saved/month):**

🥇 **Switch to public transport** — saves 80-120 kg CO₂e/month vs. car
🥈 **Set AC to 24°C** — saves 14 kg CO₂e/month
🥉 **LED lighting** — saves 10-18 kg CO₂e/month per room
4️⃣ **Unplug idle devices** — saves 6 kg CO₂e/month
5️⃣ **Compost food waste** — prevents 4-6 kg CO₂e/month
6️⃣ **Plant-based diet 1 day/week** — saves 3.8 kg CO₂e/month
7️⃣ **Shorter showers** (if using electric geyser) — saves 2-4 kg CO₂e/month
8️⃣ **Reusable bags/bottles** — saves ~2 kg CO₂e/month lifecycle

**Quick Win Checklist:**
☐ Set power management on your laptop
☐ Switch off lights when leaving rooms
☐ Air-dry clothes instead of tumble drying
☐ Choose video calls over business travel"""
    },
    "challenges": {
        "keywords": ["challenge", "activity", "goal", "points", "mission", "task", "pledge", "habit"],
        "response": """🏆 **CarbonTrack Challenges Guide**

**Active Challenge Categories:**
- 🚌 **Transit Week** — Use public transport for 5 days → **saves ~18.5 kg CO₂e, earn 80 points**
- 🔌 **Vampire Power Audit** — Unplug idle devices → **saves ~6.2 kg CO₂e/month, earn 40 points**
- ♻️ **Waste Segregation** — Compost organics for 7 days → **prevents ~4.5 kg CO₂e, earn 60 points**
- 🥦 **Green Monday** — Plant-based meals for 1 day → **saves ~3.8 kg CO₂e, earn 50 points**
- ❄️ **Thermostat Standard** — AC at 24°C for 2 weeks → **saves ~14 kg CO₂e, earn 75 points**
- 🛍️ **Plastic-Free Week** — No single-use plastic for 7 days → **saves ~2.1 kg CO₂e lifecycle, earn 45 points**

**How Points Work:**
- Points represent estimated kg CO₂e impact
- Complete challenges to improve your Sustainability Score
- Track progress in the Challenges & Progress sections

Go to **Challenges** in the sidebar to start your first eco-mission! 🌱"""
    },
    "solar": {
        "keywords": ["solar", "renewable", "wind", "green energy", "clean energy", "panel"],
        "response": """☀️ **Solar & Renewable Energy**

**Rooftop Solar (India context):**
- Average solar irradiance: ~5.5 kWh/m²/day in most of India
- 1kW rooftop system generates ~**120-150 kWh/month**
- CO₂e avoided: ~**98-123 kg/month** per kW installed
- Payback period: **4-6 years** (25-year panel life)

**Economics:**
- 1kW system cost: ~₹50,000-70,000 installed
- Government subsidy: up to 30-40% under PM Surya Ghar scheme
- Monthly bill savings: ₹600-900 per kW

**Other Renewables:**
- Community wind projects available in some states
- Green tariff options from select DISCOMs
- Buy Renewable Energy Certificates (RECs) to offset remaining grid use

**For colleges/organizations:** Bulk solar installations can achieve ROI in 3-4 years with current incentives."""
    },
    "diet": {
        "keywords": ["food", "diet", "meat", "vegan", "vegetarian", "plant", "eat", "meal", "beef", "chicken"],
        "response": """🥗 **Food & Dietary Carbon Footprint**

**Emission Factors per kg of food:**
- Beef: **~27 kg CO₂e/kg** 🔴 (highest impact)
- Lamb: **~23 kg CO₂e/kg** 🔴
- Cheese: **~13 kg CO₂e/kg** 🟡
- Chicken: **~7 kg CO₂e/kg** 🟡
- Eggs: **~4.5 kg CO₂e/kg** 🟢
- Tofu: **~3 kg CO₂e/kg** 🟢
- Lentils/Dal: **~0.9 kg CO₂e/kg** ✅
- Vegetables: **~0.4-2 kg CO₂e/kg** ✅

**India Context:**
Most Indians already have a relatively low dietary footprint due to traditional vegetarian practices. Increasing dairy or processed meat intake raises emissions.

**Tips:**
1. One plant-based day/week saves ~**3.8 kg CO₂e/month**
2. Buy seasonal and local produce (reduces food miles)
3. Reduce food waste — ~30% of food is wasted globally"""
    },
    "greeting": {
        "keywords": ["hi", "hello", "hey", "namaste", "greetings", "good morning", "good afternoon", "good evening"],
        "response": """👋 **Hello! I'm EcoBot — Your Carbon Assistant!**

I'm here to help you understand and reduce your carbon footprint. I'm trained on verified emission data and sustainability science specific to the Indian context.

**What I can help you with:**
- 🔌 Electricity & energy savings
- 🚗 Transportation & green mobility
- 🔥 Fuel & cooking emissions
- ♻️ Waste reduction & recycling
- 🌍 Understanding your carbon footprint
- 💡 Personalized eco-tips & recommendations
- 🏆 Challenges & eco-missions
- ☀️ Solar & renewable energy
- 🥗 Diet & food choices

**Try asking:**
- *"How can I reduce my electricity bill and carbon footprint?"*
- *"What's the carbon impact of my daily commute?"*
- *"How do I start composting?"*

How can I help you go green today? 🌱"""
    }
}

FALLBACK_RESPONSE = """🤔 I'm not sure about that specific topic, but I can help you with:

- ⚡ **Electricity & energy** — "How does electricity affect my carbon footprint?"
- 🚗 **Transportation** — "Is metro better than driving?"
- 🔥 **Fuel & cooking** — "How much CO₂ does LPG emit?"
- ♻️ **Waste & recycling** — "How do I reduce waste emissions?"
- 💡 **Eco tips** — "What are the best ways to reduce my footprint?"
- 🏆 **Challenges** — "How do CarbonTrack challenges work?"
- ☀️ **Solar energy** — "Should I install solar panels?"
- 🥗 **Diet & food** — "How does food choice affect emissions?"

Ask me any of these topics and I'll give you real, data-backed answers! 🌱"""


def find_best_response(message: str) -> str:
    """Match user message to topic knowledge base using keyword matching."""
    msg_lower = message.lower()

    # Score each topic by number of matched keywords
    best_topic = None
    best_score = 0

    for topic, data in ECOBOT_KNOWLEDGE.items():
        score = sum(1 for kw in data["keywords"] if kw in msg_lower)
        if score > best_score:
            best_score = score
            best_topic = topic

    if best_topic and best_score > 0:
        return ECOBOT_KNOWLEDGE[best_topic]["response"]

    return FALLBACK_RESPONSE


def get_suggestions_for_topic(message: str) -> list:
    """Return follow-up suggestion chips based on the matched topic."""
    msg_lower = message.lower()
    suggestions_map = {
        "electricity": ["How to save electricity?", "Solar panel benefits?", "LED vs regular bulbs?"],
        "transportation": ["Best eco-friendly commute options?", "Carbon cost of a flight?", "Electric vs petrol car?"],
        "fuel": ["LPG vs induction cooking?", "Solar cooking options?", "Reduce cooking gas usage?"],
        "waste": ["How to start composting?", "Plastic recycling impact?", "Zero-waste lifestyle tips?"],
        "carbon_footprint": ["Calculate my footprint", "What is CO2e?", "India's carbon average?"],
        "recommendations": ["Top 5 eco actions?", "Easiest carbon reductions?", "Monthly CO2 savings tips?"],
        "challenges": ["How to earn eco points?", "Best challenge to start?", "Sustainability score explained?"],
        "solar": ["Solar cost in India?", "Government solar subsidies?", "How much solar do I need?"],
        "diet": ["Plant-based diet savings?", "Lowest carbon foods?", "Food waste impact?"],
        "greeting": ["Tell me about electricity savings", "How to reduce transport emissions?", "Show me eco challenges"]
    }

    for topic, data in ECOBOT_KNOWLEDGE.items():
        if any(kw in msg_lower for kw in data["keywords"]):
            return suggestions_map.get(topic, [])

    return ["What is a carbon footprint?", "How to reduce electricity usage?", "Best eco-friendly habits?"]


# ─── API Endpoints ─────────────────────────────────────────────────────────────

class ChatMessageRequest:
    pass


from pydantic import BaseModel as PydanticBase

class ChatRequest(PydanticBase):
    message: str
    session_id: Optional[str] = None


class ChatMessageOut(PydanticBase):
    id: int
    role: str
    message: str
    suggestions: Optional[List[str]] = None
    created_at: str


@router.post("/message")
def send_message(req: ChatRequest, current_user=Depends(get_optional_user)):
    """Process a chat message and return EcoBot's response."""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    user_msg = req.message.strip()[:500]  # limit message length
    bot_response = find_best_response(user_msg)
    suggestions = get_suggestions_for_topic(user_msg)

    user_id = current_user["id"] if current_user else None

    # Persist to DB if we have a user_id
    with get_db() as conn:
        cursor = conn.cursor()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        cursor.execute(
            "INSERT INTO chat_messages (user_id, role, message, created_at) VALUES (?, 'user', ?, ?)",
            (user_id, user_msg, now)
        )
        cursor.execute(
            "INSERT INTO chat_messages (user_id, role, message, suggestions_json, created_at) VALUES (?, 'assistant', ?, ?, ?)",
            (user_id, bot_response, str(suggestions), now)
        )

    return {
        "response": bot_response,
        "suggestions": suggestions,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


@router.get("/history")
def get_chat_history(limit: int = 20, current_user=Depends(get_optional_user)):
    """Return recent chat history for the current user."""
    user_id = current_user["id"] if current_user else None
    with get_db() as conn:
        cursor = conn.cursor()
        if user_id:
            rows = cursor.execute(
                "SELECT id, role, message, suggestions_json, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit)
            ).fetchall()
        else:
            return []

    messages = []
    for r in reversed(rows):
        messages.append({
            "id": r["id"],
            "role": r["role"],
            "message": r["message"],
            "created_at": r["created_at"]
        })
    return messages


@router.delete("/history")
def clear_chat_history(current_user=Depends(get_optional_user)):
    """Clear chat history for the authenticated user."""
    user_id = current_user["id"] if current_user else None
    if not user_id:
        return {"message": "No history to clear."}
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_messages WHERE user_id = ?", (user_id,))
    return {"message": "Chat history cleared."}
