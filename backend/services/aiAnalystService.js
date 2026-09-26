// AI Analyst service - responsible for LLM layer
// Receives structured developer analytics and sends to LLM API
const OpenAI = require("openai");

const ai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

const analyzeDeveloper = async (analytics) => {
    const response = await ai.chat.completions.create({
        model: "openrouter/free",
        messages: [
            {
                role: 'user',
                content: `
                            
                Analyze ONLY the developer data provided below.

                Rules:
                - Do not invent or assume any data.
                - Do not calculate or reinterpret percentages incorrectly.
                - Treat every score and percentage exactly as provided.
                - Clearly distinguish GitHub metrics, LeetCode metrics, and DSA metrics.
                - Recommendations must be directly connected to the weaknesses shown in the data.
                - You may suggest practical actions, but do not invent target numbers, deadlines, 
                  percentages, scores, or performance goals unless those targets are explicitly present in the provided data.
                - Never add a topic to weakTopics or strengths unless that topic is explicitly present in the corresponding analytics array.
                - Do not infer topic priority or ordering unless it is explicitly provided.
                
                Developer data:
                ${JSON.stringify(analytics)}

                Provide:
                1. Current strengths
                2. Main weaknesses
                3. What to focus on next
                4. Three actionable recommendations

                Keep the analysis concise and practical.
                Return ONLY valid JSON.

                Use exactly this structure:

                {
                    "strengths": [],
                    "weaknesses": [],
                    "focus": [],
                    "recommendations": []
                }

                Each array should contain strings.

                Do not include Markdown, code fences, or any text outside the JSON.
                `
            }
        ]
    });

    const content = response.choices[0].message.content;
    console.log("RAW AI RESPONSE:", content);

    return JSON.parse(content);
};


module.exports = { analyzeDeveloper };
