import { useState } from "react"
import Groq from "groq-sdk"
import type { z } from "zod/v3"
import { LlmResponseJsonSchema, LlmResponseSchema } from "./schema.agent"
import { userPrompot } from "./prompt.agent"

type AgentOutput = z.infer<typeof LlmResponseSchema>
type AgentError = Error | null

type AgentMeta = {
  data: AgentOutput | null
  isLoading: boolean
  isError: boolean
  error: AgentError
}

type SubmitQuery = (
  prompt: string,
  flatHabits: unknown,
  flatPlans: unknown
) => Promise<AgentOutput | null>

function getGroq() {
  return new Groq({
    dangerouslyAllowBrowser: true,
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  })
}

export function useAgent(): [SubmitQuery, AgentMeta] {
  const [data, setData] = useState<AgentOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<AgentError>(null)

  const submitQuery: SubmitQuery = async (prompt, flatHabits, flatPlans) => {
    setIsLoading(true)
    setIsError(false)
    setError(null)
    setData(null)

    try {
      const response = await getGroq().chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          userPrompot,
          {
            role: "user" as const,
            content: JSON.stringify({
              trigger: prompt,
              state: { habits: flatHabits, plans: flatPlans },
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "llm_response",
            schema: LlmResponseJsonSchema,
          },
        },
      })

      const raw = response.choices?.[0]?.message.content ?? "{}"
      const parsed = JSON.parse(raw)
      const result = LlmResponseSchema.safeParse(parsed)

      if (!result.success) {
        throw new Error("Invalid agent response structure")
      }

      setData(result.data)
      return result.data
    } catch (err) {
      const next = err instanceof Error ? err : new Error(String(err))
      setIsError(true)
      setError(next)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return [submitQuery, { data, isLoading, isError, error }]
}
