import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type JudgeScore = 'better' | 'worse' | 'neutral'

export type JudgeResult = {
  score: JudgeScore
  reasoning: string
}

export async function judge(
  user_input: string,
  baseline_output: string,
  challenger_output: string
): Promise<JudgeResult> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert AI output evaluator. Compare two AI responses to the same user input and determine if the challenger response is better, worse, or neutral compared to the baseline.

Evaluate based on:
- Accuracy and correctness
- Completeness
- Clarity and helpfulness
- Conciseness without sacrificing quality

User Input:
${user_input}

Baseline Response:
${baseline_output}

Challenger Response:
${challenger_output}

Respond with a JSON object only, no other text:
{
  "score": "better" | "worse" | "neutral",
  "reasoning": "brief explanation of your assessment"
}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return { score: 'neutral', reasoning: 'Unexpected response type from judge' }
    }

    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { score: 'neutral', reasoning: 'Could not parse judge response' }
    }

    const parsed = JSON.parse(jsonMatch[0])
    const score = parsed.score as JudgeScore

    if (!['better', 'worse', 'neutral'].includes(score)) {
      return { score: 'neutral', reasoning: 'Invalid score from judge' }
    }

    return {
      score,
      reasoning: parsed.reasoning || '',
    }
  } catch {
    return { score: 'neutral', reasoning: 'Judge failed to evaluate' }
  }
}
