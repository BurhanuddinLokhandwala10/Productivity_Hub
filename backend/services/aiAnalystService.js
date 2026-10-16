// AI Analyst service - responsible for LLM layer
// Receives structured developer analytics and sends to LLM API
const OpenAI = require("openai");

const ai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    timeout: 3000
});

/**
 * Generates an analytical fallback when LLM is unavailable or times out
 */
const generateAnalyticalFallback = (analytics) => {
    const gh = analytics.github || {};
    const lc = analytics.leetcode || {};
    const dsa = analytics.dsa || {};

    const ghScore = gh.score || 0;
    const dsaScore = dsa.readinessScore || 0;
    const mustPct = dsa.must?.percentage || 0;
    const weakTopics = (dsa.weakTopics || []).map(t => t.topic);
    const strengthsList = (dsa.strengths || []).map(t => t.topic);

    const overallSummary = `Preparation assessment: GitHub health is at ${ghScore}/100 with trend '${gh.trend || 'STABLE'}'. DSA readiness stands at ${dsaScore}% (${dsa.label || 'EARLY_STAGE'}) with MUST-solve coverage at ${mustPct}%. LeetCode progress reflects ${lc.totalProgress || 0} recent questions solved.`;

    const prepStatus = {
        label: dsa.label || (dsaScore >= 75 ? "STRONG_PREPARATION" : dsaScore >= 50 ? "NEARLY_READY" : "NEEDS_IMPROVEMENT"),
        score: dsaScore,
        summary: `Current DSA readiness is ${dsaScore}% with ${mustPct}% of MUST questions completed.`
    };

    const strengths = [];
    if (ghScore >= 50) strengths.push(`GitHub activity is healthy (score: ${ghScore}/100) with ${gh.activity?.currentMonthCommits || 0} commits this month.`);
    if (strengthsList.length > 0) strengths.push(`Strong DSA topics: ${strengthsList.slice(0, 3).join(', ')}.`);
    if (lc.current?.totalSolved > 0) strengths.push(`LeetCode foundation: ${lc.current.totalSolved} total problems solved.`);
    if (strengths.length === 0) strengths.push("Initial repository and environment setup complete.");

    const criticalGaps = [];
    if (mustPct < 60) criticalGaps.push(`MUST question coverage is low (${mustPct}%), leaving essential interview problem types unaddressed.`);
    if (weakTopics.length > 0) criticalGaps.push(`Identified weak topics requiring immediate practice: ${weakTopics.slice(0, 4).join(', ')}.`);
    if ((lc.current?.streak || 0) < 3) criticalGaps.push(`Problem solving consistency needs improvement (current streak: ${lc.current?.streak || 0} days).`);

    const priorityAnalysis = [
        {
            priority: mustPct < 70 ? "Prioritize MUST-solve DSA questions" : "Strengthen consistency",
            reason: mustPct < 70 ? `MUST question coverage is currently at ${mustPct}%, which forms the core of technical interviews.` : "Maintain regular daily practice across platforms.",
            basedOn: ["dsa.must.percentage", "dsa.readinessScore"]
        },
        {
            priority: weakTopics.length > 0 ? `Target weak topics: ${weakTopics.slice(0, 2).join(', ')}` : "Maintain repository activity",
            reason: weakTopics.length > 0 ? "Underperforming topics reduce interview readiness." : "Sustained commit history shows ongoing technical engagement.",
            basedOn: weakTopics.length > 0 ? ["dsa.weakTopics"] : ["github.activity"]
        }
    ];

    const nextActions = [
        {
            action: `Solve at least 5 MUST-tier problems in ${weakTopics[0] || 'core topics'} this week`,
            reason: `Focusing on MUST problems directly increases readiness from the current ${dsaScore}%.`,
            area: "DSA"
        },
        {
            action: "Maintain a daily LeetCode practice streak of at least 1 problem/day",
            reason: "Consistent problem solving builds retention and pattern recognition.",
            area: "LeetCode"
        },
        {
            action: `Push project code regularly to maintain active days (currently ${gh.consistency?.monthlyActiveDays || 0} active days this month)`,
            reason: "Consistent commits demonstrate ongoing development practice.",
            area: "GitHub"
        }
    ];

    const recommendations = [
        `Focus primarily on MUST DSA questions before advancing to optional topics.`,
        `Dedicate structured revision sessions to weak areas: ${weakTopics.slice(0, 3).join(', ') || 'unsolved topics'}.`,
        `Keep GitHub commits active with consistent daily pushes.`
    ];

    return {
        overallSummary,
        preparationStatus: prepStatus,
        strengths,
        criticalGaps,
        github: {
            summary: `Health score: ${ghScore}/100. Trend: ${gh.trend || 'STABLE'}. Active days this month: ${gh.consistency?.monthlyActiveDays || 0}.`,
            strengths: ghScore >= 50 ? [`Strong commit activity with ${gh.activity?.currentMonthCommits || 0} commits this month.`] : [],
            concerns: ghScore < 50 ? [`Commit activity is relatively low (${gh.activity?.currentMonthCommits || 0} commits this month).`] : []
        },
        leetcode: {
            summary: `Total solved: ${lc.current?.totalSolved || 0}. Recent progress: +${lc.totalProgress || 0}. Current streak: ${lc.current?.streak || 0} days.`,
            strengths: (lc.current?.totalSolved || 0) > 0 ? [`Solved ${lc.current?.totalSolved} problems across difficulty levels.`] : [],
            concerns: (lc.totalProgress || 0) <= 0 ? ["No new LeetCode submissions recorded recently."] : []
        },
        dsa: {
            summary: `Readiness score: ${dsaScore}%. Target: ${dsa.target || 'PRODUCT_BASED'}. Status: ${dsa.label || 'EARLY_STAGE'}.`,
            strengths: strengthsList,
            weakTopics,
            criticalAreas: mustPct < 80 ? [`MUST coverage is at ${mustPct}%. Aim for 80%+ coverage.`] : []
        },
        priorityAnalysis,
        nextActions,
        preparationOutlook: dsaScore >= 75
            ? "Strong trajectory: on track for interview readiness with focused weak-topic polish."
            : "Foundational phase: prioritized focus on MUST problems will produce rapid readiness gains.",
        recommendations,
        // Backward compatibility keys
        weaknesses: criticalGaps,
        focus: nextActions.map(a => a.action)
    };
};

const cleanAndParseJson = (rawContent) => {
    let text = rawContent.trim();
    // Remove markdown code fences if present
    if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\s*/i, "");
        text = text.replace(/\s*```$/i, "");
    }
    // Find first { and last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.slice(firstBrace, lastBrace + 1);
    }
    return JSON.parse(text);
};


const extractJsonObject = (content) => {
    const start = content.indexOf("{");

    if (start === -1) {
        throw new Error("No JSON object found in AI response");
    }

    let depth = 0;
    let insideString = false;
    let escaped = false;

    for (let i = start; i < content.length; i++) {
        const char = content[i];

        if (insideString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                insideString = false;
            }
            continue;
        }

        if (char === '"') {
            insideString = true;
        } else if (char === "{") {
            depth++;
        } else if (char === "}") {
            depth--;

            if (depth === 0) {
                return JSON.parse(content.slice(start, i + 1));
            }
        }
    }

    throw new Error("Incomplete JSON object in AI response");
};


const analyzeDeveloper = async (analytics) => {
    try {
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    max_tokens: 5000,
                    reasoning: {
                        effort: "low",
                        exclude: true
                    },
                    response_format: {
                        type: "json_object"
                    },
                    messages: [
                        {
                            role: "system",
                            content: `You are a Developer Preparation Analyst.
                            Return exactly one valid JSON object matching the user's requested schema.
                            Do not output your reasoning, thinking process, or intermediate analysis.
                            Do not include Markdown, code fences, introductions, or text outside the JSON.
                            Use only the supplied metrics. Never invent scores, deadlines, or statistics.
                            Keep the response concise and follow the requested item limits.`
                        },
                        {
                            role: "user",
                            content: `Analyze the developer preparation data provided below. Act as a Developer Preparation Analyst.

                                    Rules:
                                    - Base every insight strictly on the provided data. Do NOT invent missing metrics, deadlines, or test scores.
                                    - Clearly differentiate GitHub activity, LeetCode problem solving, and curated DSA sheet coverage.
                                    - Explain WHY something is a strength or weakness by linking cause to metric.
                                    - Prioritize actions based on data: if MUST DSA coverage is low, prioritize foundational DSA over non-critical tasks.
                                    - If data in an area is insufficient, explicitly state that data is insufficient.
                                    - Return ONLY valid JSON matching this exact structure:

                                    {
                                    "overallSummary": "High-level summary of developer's current preparation state",
                                    "preparationStatus": {
                                     "label": "EARLY_STAGE | NEEDS_IMPROVEMENT | NEARLY_READY | STRONG_PREPARATION | INTERVIEW_READY",
                                        "score": 0,
                                        "summary": "Short explanation of overall readiness"
                                    },
                                    "strengths": ["Clear strength referencing actual metrics"],
                                    "criticalGaps": ["Clear gap referencing actual metrics and why it matters"],
                                    "github": {
                                        "summary": "GitHub status overview",
                                        "strengths": ["GitHub specific positive observations"],
                                        "concerns": ["GitHub specific areas needing improvement"]
                                    },
                                    "leetcode": {
                                        "summary": "LeetCode status overview",
                                        "strengths": ["LeetCode specific positive observations"],
                                        "concerns": ["LeetCode specific areas needing improvement"]
                                    },
                                    "dsa": {
                                        "summary": "DSA readiness overview",
                                        "strengths": ["DSA topics with high pass rates"],
                                        "weakTopics": ["DSA topics with low pass rates"],
                                        "criticalAreas": ["Urgent coverage needs like MUST questions"]
                                    },
                                    "priorityAnalysis": [
                                        {
                                        "priority": "What should be prioritized",
                                        "reason": "Why this takes precedence over other areas",
                                        "basedOn": ["relevantMetricNames"]
                                        }
                                    ],
                                    "nextActions": [
                                        {
                                        "action": "Concrete next action to take",
                                        "reason": "Why this action addresses a specific gap",
                                        "area": "DSA | LeetCode | GitHub"
                                        }
                                    ],
                                    "preparationOutlook": "Realistic perspective on readiness and time-to-interview",
                                    "recommendations": ["Direct actionable recommendation"]
                                    }
                                    Response efficiency rules:
                                    - Be concise and specific.
                                    - Return at most 3 strengths and 3 critical gaps.
                                    - Return at most 3 priorityAnalysis items.
                                    - Return at most 5 nextActions.
                                    - Return at most 4 recommendations.
                                    - Keep each explanation to 1-2 sentences.
                                    - Return valid JSON only, without markdown.


                                    CRITICAL OUTPUT RULES:
                                    - Return ONLY a valid JSON object.
                                    - Do not write introductions such as "Here's the analysis".
                                    - Do not use Markdown code fences.
                                    - The first character of the response must be {.
                                    - The last character of the response must be }.
                                    - Use double quotes for all JSON keys and string values.
                                    - Do not include comments or trailing commas.
                                    - Follow the exact JSON structure specified in the prompt.


                                    Developer data:
                                    ${JSON.stringify(analytics, null, 2)}`
                        }
                    ]
                }),
                signal: AbortSignal.timeout(120000)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter diagnostic:", {
                httpStatus: response.status,
                error: data.error,
                choiceError: data.choices?.[0]?.error,
                finishReason: data.choices?.[0]?.finish_reason
            });

            throw new Error(
                data.error?.message ||
                data.choices?.[0]?.error?.message ||
                `OpenRouter HTTP ${response.status}`
            );
        }

        const choice = data.choices?.[0];
        const message = choice?.message;

        // // Debug the response without printing your API key or analytics.
        // console.log("AI response diagnostics:", {
        //     model: data.model,
        //     finish_reason: choice?.finish_reason,
        //     native_finish_reason: choice?.native_finish_reason,
        //     usage: data.usage,
        //     hasContent: Boolean(message?.content),
        //     hasReasoning: Boolean(message?.reasoning)
        // });

        const rawContent = message?.content;

        if (typeof rawContent !== "string" || !rawContent.trim()) {
            console.error("OpenRouter diagnostic:", {
                httpStatus: response.status,
                error: data.error,
                choiceError: data.choices?.[0]?.error,
                finishReason: data.choices?.[0]?.finish_reason
            });

            throw new Error(
                data.error?.message ||
                data.choices?.[0]?.error?.message ||
                `OpenRouter HTTP ${response.status}`
            );
        }

        const parsed = extractJsonObject(rawContent);

        console.log("AI analysis parsed successfully");

        // Preserve backward compatibility
        if (!parsed.weaknesses && parsed.criticalGaps) {
            parsed.weaknesses = parsed.criticalGaps;
        }

        if (!parsed.focus && parsed.nextActions) {
            parsed.focus = parsed.nextActions.map(item => item.action);
        }

        return parsed;

    } catch (error) {
        console.error("AI ANALYSIS FAILED:", error.name, error.message);
        return generateAnalyticalFallback(analytics);
    }
};


module.exports = { analyzeDeveloper, generateAnalyticalFallback };
