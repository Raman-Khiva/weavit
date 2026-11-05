import { useState } from "react"
import Groq from "groq-sdk"
import type { z } from "zod/v3"
import {
  ActionItemSchema,
  LlmResponseJsonSchema,
  LlmResponseSchema,
  PlanPreviewSchema,
  type ActionItem,
} from "./schema.agent"
import { userPrompot } from "./prompt.agent"
import { guestPrompt } from "./prompt.guest.agent"

type AgentOutput = z.infer<typeof LlmResponseSchema>
type AgentError = Error | null

type AgentMeta = {
  data: AgentOutput | null
  isLoading: boolean
  isError: boolean
  error: AgentError
}

export type AgentChatMode = "workspace" | "guest"

export type AgentChatTurn = {
  role: "user" | "assistant"
  content: string
}

export type SubmitQueryOptions = {
  mode?: AgentChatMode
  /** Prior turns for multi-message guest (or workspace) conversations */
  history?: AgentChatTurn[]
}

type SubmitQuery = (
  prompt: string,
  state: unknown,
  options?: SubmitQueryOptions
) => Promise<AgentOutput | null>

function getGroq() {
  return new Groq({
    dangerouslyAllowBrowser: true,
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  })
}

/**
 * Prefer strict parse; if Groq returns slightly-invalid extras (nulls / one bad action),
 * salvage the message + every individually valid action so capabilities stay unlocked.
 */
export function parseAgentResponse(raw: unknown): AgentOutput | null {
  const strict = LlmResponseSchema.safeParse(raw)
  if (strict.success) return strict.data

  if (!raw || typeof raw !== "object") return null
  const obj = raw as { message?: unknown; actions?: unknown; preview?: unknown }

  const actions: ActionItem[] = []
  if (Array.isArray(obj.actions)) {
    for (const item of obj.actions) {
      const parsed = ActionItemSchema.safeParse(item)
      if (parsed.success) actions.push(parsed.data)
    }
  }

  const message =
    typeof obj.message === "string" && obj.message.trim()
      ? obj.message
      : actions.length > 0
        ? "Done."
        : null

  if (!message) return null

  const previewParse = PlanPreviewSchema.safeParse(obj.preview)
  return {
    message,
    actions,
    preview: previewParse.success ? previewParse.data : null,
  }
}

/** Strip UI marker; returns cleaned markdown + whether login CTA should show */
export function splitGuestLoginMarker(message: string): {
  text: string
  needsLogin: boolean
} {
  const needsLogin = /\[\[LOGIN\]\]/.test(message)
  const text = message.replace(/\n*\[\[LOGIN\]\]\s*$/m, "").trimEnd()
  return { text, needsLogin }
}

export function useAgent(): [SubmitQuery, AgentMeta] {
  const [data, setData] = useState<AgentOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<AgentError>(null)

  const submitQuery: SubmitQuery = async (prompt, state, options) => {
    setIsLoading(true)
    setIsError(false)
    setError(null)
    setData(null)

    const mode = options?.mode ?? "workspace"
    const history = options?.history ?? []
    const system = mode === "guest" ? guestPrompt : userPrompot

    try {
      const historyMessages = history.map((turn) => ({
        role: turn.role as "user" | "assistant",
        content: turn.content,
      }))

      const response = await getGroq().chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          system,
          ...historyMessages,
          {
            role: "user" as const,
            content:
              mode === "guest"
                ? prompt
                : JSON.stringify({
                    trigger: prompt,
                    now: new Date().toISOString(),
                    state,
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
      const parsed = parseAgentResponse(JSON.parse(raw))

      if (!parsed) {
        throw new Error("Invalid agent response structure")
      }

      // Guests never get executable actions / plan previews
      const safe: AgentOutput =
        mode === "guest"
          ? { message: parsed.message, actions: [], preview: null }
          : parsed

      setData(safe)
      return safe
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
