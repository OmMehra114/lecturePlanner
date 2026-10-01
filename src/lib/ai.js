import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Normalizes topic hours to ensure the sum exactly matches target totalHours
 */
function normalizeHours(topics, targetHours) {
  if (!topics || topics.length === 0) return topics;

  let currentSum = topics.reduce((acc, t) => acc + (Math.max(1, parseInt(t.lectures, 10) || 1)), 0);
  
  const result = topics.map((t, idx) => ({
    ...t,
    srNo: idx + 1,
    lectures: Math.max(1, parseInt(t.lectures, 10) || 1),
  }));

  // If already matches, return cleaned topics
  if (currentSum === targetHours) {
    return result;
  }

  // If sum doesn't match, distribute difference
  let difference = targetHours - currentSum;
  let idx = result.length - 1;

  while (difference !== 0 && result.length > 0) {
    const targetItem = result[Math.abs(idx) % result.length];
    if (difference > 0) {
      targetItem.lectures += 1;
      difference--;
    } else if (difference < 0) {
      if (targetItem.lectures > 1) {
        targetItem.lectures -= 1;
        difference++;
      }
    }
    idx--;
  }

  return result;
}

/**
 * Extract structured topics from syllabus using Groq or Gemini API
 */
export async function generateTopicsFromSyllabus(syllabusText, totalHours = 40) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    throw new Error('Missing API Key. Please provide GROQ_API_KEY or GEMINI_API_KEY in .env.local.');
  }

  const prompt = `You are an expert university curriculum planner and instructional designer.

Given the course syllabus below, extract and structure all topics into sequential, highly granular teaching modules exactly as they should appear in a lecture plan table.

RULES:
1. STRICT SEQUENCE: Retain the natural pedagogical order of topics from start to finish. Do NOT skip or reorder.
2. ATOMIC TOPICS: Break down the syllabus into single, small rows of "Topics Covered" rather than large units with subtopics. Each row should represent 1 to 3 lectures at most. Do not use a "subTopics" array.
3. ALLOCATE HOURS: Distribute teaching lectures/hours across these topics so that the total sum of all "lectures" equals EXACTLY ${totalHours}.
4. RETURN FORMAT: Return ONLY a valid JSON array of objects. CRITICAL: Output ONLY valid, minified JSON without markdown blocks, backticks, or any preamble.

Target Total Hours: ${totalHours}

Syllabus Content:
"""
${syllabusText.slice(0, 12000)}
"""

Schema:
[
  {
    "srNo": 1,
    "topic": "Fundamentals of Software Engineering Concepts and Process",
    "lectures": 1
  },
  {
    "srNo": 2,
    "topic": "Software Development Life Cycle, Important Steps and Effort Distribution",
    "lectures": 1
  },
  {
    "srNo": 3,
    "topic": "Prototype Model, Incremental Model, Spiral, RAD",
    "lectures": 3
  }
]`;

  let rawJson = '';

  // 1. Attempt with Groq (openai/gpt-oss-120b or openai/gpt-oss-20b)
  if (groqApiKey) {
    try {
      const groq = new OpenAI({
        apiKey: groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an AI syllabus analyzer that outputs valid JSON arrays.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'openai/gpt-oss-120b',
          temperature: 0.1,
          max_tokens: 8000,
        });

        rawJson = completion.choices[0]?.message?.content || '';
      } catch (groqErr1) {
        console.warn('Groq 120b error, trying 20b fallback:', groqErr1.message);
        try {
          const groq = new OpenAI({
            apiKey: groqApiKey,
            baseURL: 'https://api.groq.com/openai/v1',
          });
          const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'openai/gpt-oss-20b',
            temperature: 0.1,
            max_tokens: 8000,
          });
          rawJson = completion.choices[0]?.message?.content || '';
        } catch (groqErr2) {
          if (!geminiApiKey) throw groqErr2;
        }
      }
  }

  // 2. Fallback to Gemini if configured
  if (!rawJson && geminiApiKey) {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    rawJson = result.response.text();
  }

  console.log("Raw JSON Response from AI:", rawJson);

  // Clean JSON response
  let cleaned = rawJson
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  let parsed = [];
  try {
    const parsedData = JSON.parse(cleaned);
    parsed = Array.isArray(parsedData)
      ? parsedData
      : parsedData.topics || parsedData.syllabus || parsedData.schedule || [];
  } catch (parseError) {
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error(`Failed to parse AI syllabus response: ${parseError.message}`);
    }
  }

  return normalizeHours(parsed, totalHours);
}