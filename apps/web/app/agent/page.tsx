"use client";

import React from "react";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable";
import { PromptInput, PromptInputTextarea, PromptInputSubmit, PromptInputFooter, PromptInputHeader } from "@workspace/ui/components/ai-elements/prompt-input";
import { Conversation, ConversationContent } from "@workspace/ui/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@workspace/ui/components/ai-elements/message";
import { ChainOfThought, ChainOfThoughtHeader, ChainOfThoughtContent, ChainOfThoughtStep } from "@workspace/ui/components/ai-elements/chain-of-thought";
import { PlanPreview as PlanPreviewView } from "@/components/agent/plan-preview";
import { GenerationStatus } from "@/components/agent/generation-status";
import { PromptInputBody, PromptInputActionMenu, PromptInputActionMenuTrigger, PromptInputActionMenuContent, PromptInputActionMenuItem } from "@workspace/ui/components/ai-elements/prompt-input";
import { SequencedAchievementList, type SequencedAchievementItem, type SequencedAchievementProgress } from "@workspace/ui/components/achievement-list";
import { CheckIcon, BotIcon, Loader2Icon, ChevronRightIcon, DownloadIcon, PlusIcon, Target, Layers, CalendarClock, ClipboardCheck, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "next/navigation";
import { useAgentRuntime } from "@/features/agent/use-agent-runtime";
import type { PlanPreview as AgentPlanPreview } from "@/features/agent/schema.agent";

// ============================================================================
// Types
// ============================================================================

interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  parts: Array<{
    type: "text" | "reasoning" | "tool-invocation" | "tool-result" | "plan";
    text?: string;
    reasoning?: string;
    toolInvocation?: {
      toolName: string;
      state: "call" | "result" | "partial-call";
      args: any;
      result?: any;
    };
    plan?: {
      title: string;
      description: string;
      phases: Array<{
        id: string;
        title: string;
        description?: string;
        category?: string;
        status: "pending" | "active" | "completed";
        startDate?: string;
        endDate?: string;
        tasks: Array<{
          id: string;
          title: string;
          description?: string;
          category?: string;
          priority?: "low" | "medium" | "high";
          status: "pending" | "in_progress" | "completed" | "skipped";
        }>;
      }>;
    };
  }>;
}

type PlaybackStage = "thoughts" | "collapse" | "message" | "cards" | "closing" | "done";

function RevealedText({
  text,
  active,
  onComplete,
}: {
  text: string;
  active: boolean;
  onComplete: () => void;
}) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [count, setCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const finishedRef = useRef(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active || finishedRef.current) return;
    if (count >= words.length) {
      finishedRef.current = true;
      onCompleteRef.current();
      return;
    }
    const timeout = window.setTimeout(
      () => setCount((current) => current + 1),
      words[count]?.trim() ? 42 : 0
    );
    return () => window.clearTimeout(timeout);
  }, [active, count, words]);

  if (!active && count === 0) return null;

  return (
    <MessageResponse className="prose prose-sm dark:prose-invert max-w-none">
      {words.slice(0, count).join("")}
    </MessageResponse>
  );
}

function nextStage(intro: string, cards: SequencedAchievementItem[], closing: string, from: PlaybackStage): PlaybackStage {
  if (from === "thoughts" || from === "collapse") {
    if (intro) return "message";
    if (cards.length > 0) return "cards";
    if (closing) return "closing";
    return "done";
  }
  if (from === "message") {
    if (cards.length > 0) return "cards";
    if (closing) return "closing";
    return "done";
  }
  if (from === "cards") return closing ? "closing" : "done";
  return "done";
}

function AgentMessageBubble({
  message,
  onAssembly,
}: {
  message: AgentMessage;
  onAssembly?: (state: SequencedAchievementProgress) => void;
}) {
  const intro = message.parts.find((part) => part.type === "text" && part.text)?.text ?? "";
  const closing = [...message.parts].reverse().find((part) => part.type === "text" && part.text)?.text ?? "";
  const closingText = closing !== intro ? closing : "";
  const reasoning = message.parts.find((part) => part.type === "reasoning")?.reasoning ?? "";
  const thoughts = useMemo(
    () => reasoning.split("\n").map((line) => line.trim()).filter(Boolean),
    [reasoning]
  );
  const cards = useMemo<SequencedAchievementItem[]>(() => {
    const plan = message.parts.find((part) => part.type === "plan")?.plan;
    if (!plan) return [];
    return [
      {
        id: "project-header",
        title: plan.title,
        description: "Assembling the project header",
      },
      ...plan.phases.map((phase) => ({
        id: phase.id,
        title: phase.title,
        description: phase.description || phase.category || "Phase overview",
        details: phase.tasks.map((task) => task.title),
      })),
    ];
  }, [message.parts]);

  const [stage, setStage] = useState<PlaybackStage>(thoughts.length > 0 ? "thoughts" : nextStage(intro, cards, closingText, "thoughts"));
  const [thoughtCount, setThoughtCount] = useState(0);
  const [chainOpen, setChainOpen] = useState(true);

  useEffect(() => {
    if (stage !== "thoughts") return;
    if (thoughts.length === 0) {
      setStage(nextStage(intro, cards, closingText, "thoughts"));
      return;
    }
    if (thoughtCount < thoughts.length) {
      const timeout = window.setTimeout(
        () => setThoughtCount((count) => count + 1),
        thoughtCount === 0 ? 240 : 480
      );
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => setStage("collapse"), 360);
    return () => window.clearTimeout(timeout);
  }, [cards, closingText, intro, stage, thoughtCount, thoughts.length]);

  useEffect(() => {
    if (stage !== "collapse") return;
    setChainOpen(false);
    const timeout = window.setTimeout(() => {
      setStage(nextStage(intro, cards, closingText, "collapse"));
    }, 420);
    return () => window.clearTimeout(timeout);
  }, [cards, closingText, intro, stage]);

  const showMessage = stage === "message" || stage === "cards" || stage === "closing" || stage === "done";
  const showCards = stage === "cards" || stage === "closing" || stage === "done";
  const showClosing = stage === "closing" || stage === "done";

  return (
    <Message from="assistant">
      <MessageContent className="w-full">
        {thoughts.length > 0 && (
          <ChainOfThought open={chainOpen} onOpenChange={setChainOpen} className="mb-4">
            <ChainOfThoughtHeader>
              {stage === "thoughts" ? "Thinking" : "Chain of Thought"}
            </ChainOfThoughtHeader>
            <ChainOfThoughtContent>
              {thoughts.slice(0, thoughtCount).map((thought, index) => (
                <ChainOfThoughtStep key={`${index}-${thought}`} label={thought} status="complete" />
              ))}
            </ChainOfThoughtContent>
          </ChainOfThought>
        )}

        {showMessage && intro && (
          <RevealedText
            text={intro}
            active={stage === "message"}
            onComplete={() => setStage(nextStage(intro, cards, closingText, "message"))}
          />
        )}

        {showCards && cards.length > 0 && (
          <SequencedAchievementList
            items={cards}
            durationMs={4200}
            onProgress={onAssembly}
            onComplete={() => setStage(nextStage(intro, cards, closingText, "cards"))}
          />
        )}

        {showClosing && closingText && (
          <RevealedText
            text={closingText}
            active={stage === "closing"}
            onComplete={() => setStage("done")}
          />
        )}
      </MessageContent>
    </Message>
  );
}

function UserMessageBubble({ message }: { message: AgentMessage }) {
  return (
    <Message from="user">
      <MessageContent>
        {message.parts.map((part, index) => {
          if (part.type === "text" && part.text) {
            return (
              <MessageResponse key={index} className="prose prose-sm dark:prose-invert max-w-none" children={part.text} />
            );
          }
          return null;
        })}
      </MessageContent>
    </Message>
  );
}

// ============================================================================
// Typing Indicator
// ============================================================================

function TypingIndicator() {
  return (
    <Message from="assistant">
      <MessageContent>
        <div className="flex items-center gap-2 text-muted-foreground">
          <BotIcon className="size-4" />
          <div className="flex gap-1">
            <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="size-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm font-mono text-muted-foreground/50">Generating...</span>
        </div>
      </MessageContent>
    </Message>
  );
}

// ============================================================================
// Task Execution Steps (Premium Indicators)
// ============================================================================

function TaskExecutionSteps({ steps }: { steps: Array<{ label: string; status: "pending" | "active" | "complete"; description?: string }> }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={cn(
            "flex items-start gap-3 transition-all duration-300",
            step.status === "complete" && "opacity-70"
          )}
        >
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "size-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                step.status === "complete"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : step.status === "active"
                  ? "bg-primary border-primary text-primary-foreground animate-pulse"
                  : "bg-muted border-border"
              )}
            >
              {step.status === "complete" && <CheckIcon className="size-3.5 stroke-[3]" />}
              {step.status === "active" && <Loader2Icon className="size-3.5 animate-spin" />}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-1/2 top-6 bottom-0 w-px -translate-x-1/2",
                  step.status === "complete" ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p
              className={cn(
                "font-medium text-sm transition-colors",
                step.status === "complete" ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Agent Sidebar (Conversation)
// ============================================================================

function AgentSidebar({
  messages,
  onSubmit,
  isLoading,
  planData,
  onAssembly,
}: {
  messages: AgentMessage[];
  onSubmit: (text: string) => void;
  isLoading: boolean;
  planData?: AgentMessage["parts"][number]["plan"] | null;
  onAssembly?: (state: SequencedAchievementProgress) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = useCallback(
    (message: { text: string; files: any[] }, e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (message.text.trim() && !isLoading) {
        onSubmit(message.text.trim());
        setInputValue("");
      }
    },
    [inputValue, isLoading, onSubmit]
  );

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo-weavit.png"
            alt="Weavit"
            className="size-9 rounded-xl object-contain"
          />
          <div>
            <h1 className="font-semibold text-foreground">weavit agent</h1>
            <p className="text-xs text-muted-foreground">Your AI planning assistant</p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? null : (
            <>
              {messages.map((message) =>
                message.role === "user" ? (
                  <UserMessageBubble key={message.id} message={message} />
                ) : (
                  <AgentMessageBubble
                    key={message.id}
                    message={message}
                    onAssembly={message.id === messages[messages.length - 1]?.id ? onAssembly : undefined}
                  />
                )
              )}
              {isLoading && <TypingIndicator />}
            </>
          )}
        </ConversationContent>
      </Conversation>

      {/* Input */}
      <div className="border-t border-border p-3 bg-background/95 backdrop-blur">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputHeader>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger>
                <PlusIcon className="size-4" />
              </PromptInputActionMenuTrigger>
              <PromptInputActionMenuContent>
                <PromptInputActionMenuItem>Attach File</PromptInputActionMenuItem>
                <PromptInputActionMenuItem>Take Screenshot</PromptInputActionMenuItem>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isLoading ? "Agent is thinking..." : "Ask about roadmaps, habits, todos, or deadlines…"}
              disabled={isLoading}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit status={isLoading ? "streaming" : "ready"} variant="default" size="icon-sm">
              <ChevronRightIcon className="size-4" />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

// ============================================================================
// Main Agent Page
// ============================================================================

type ExecutionStep = { label: string; status: "pending" | "active" | "complete"; description?: string };

const INITIAL_STEPS: ExecutionStep[] = [
  { label: "Understanding your request", status: "active", description: "Reading goals against your workspace" },
  { label: "Planning actions", status: "pending", description: "Choosing allowlisted mutations" },
  { label: "Generating preview", status: "pending", description: "Building the live right-hand panel" },
  { label: "Applying to workspace", status: "pending", description: "Persisting habits, todos, deadlines, plans" },
];

function toUiPlan(
  preview: AgentPlanPreview
): NonNullable<AgentMessage["parts"][number]["plan"]> {
  return {
    title: preview.title,
    description: preview.description,
    phases: preview.phases.map((phase) => ({
      id: phase.id,
      title: phase.title,
      description: phase.description ?? undefined,
      category: phase.category ?? undefined,
      status: phase.status,
      startDate: phase.startDate ?? undefined,
      endDate: phase.endDate ?? undefined,
      tasks: phase.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description ?? undefined,
        category: task.category ?? undefined,
        priority: task.priority ?? undefined,
        status: task.status,
      })),
    })),
  };
}

const FEATURE_HIGHLIGHTS = [
  {
    icon: Layers,
    title: "Roadmaps & Plans",
    description: "Turn goals into phased roadmaps with executable tasks",
  },
  {
    icon: Target,
    title: "Habits & Streaks",
    description: "Log rituals, keep streaks, and stay consistent daily",
  },
  {
    icon: ClipboardCheck,
    title: "Todos & Tasks",
    description: "Capture work, prioritize it, and clear it from the board",
  },
  {
    icon: CalendarClock,
    title: "Deadlines",
    description: "Keep due dates visible so nothing slips past you",
  },
] as const;

const EXAMPLE_PROMPTS = [
  "Build a 2-month DSA interview prep roadmap",
  "Create a daily reading and exercise habit plan",
  "Break my system design project into phases",
  "Set deadlines for this week's assignments",
];

function AgentEmptyState({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const seeded = useRef(false);

  useEffect(() => {
    const fromQuery = searchParams.get("prompt")?.trim();
    if (!fromQuery || seeded.current) return;
    seeded.current = true;
    setInput(fromQuery);
  }, [searchParams]);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    onSubmit(text);
  };

  return (
    <div className="flex h-screen flex-col text-foreground">
      <header className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <img
            src="/logo-weavit.png"
            alt="Weavit"
            className="size-7 rounded-lg object-contain"
          />
          <div>
            <span className="text-sm font-semibold">weavit agent</span>
            <p className="text-[11px] text-muted-foreground">
              Full agent · live workspace preview
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <a href="/dashboard">
            <LayoutDashboard className="size-3.5" />
            Dashboard drawer
          </a>
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl border bg-card shadow-xs">
              <BotIcon className="size-8 text-primary" />
            </div>
          </div>
          <p className="rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            Same agent as the dashboard drawer · plus live preview
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            What should we work on?
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Build roadmaps with a live preview, scaffold habits and deadlines,
            then keep chatting. Quick check-ins can stay on the dashboard drawer.
          </p>
        </div>

        <div className="mb-8 w-full max-w-3xl">
          <div className="relative rounded-2xl border bg-card shadow-xs focus-within:ring-1 focus-within:ring-ring/40">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder="e.g. Plan a 6-week system design roadmap with weekly milestones…"
              rows={4}
              className="min-h-[140px] resize-none rounded-2xl border-0 bg-transparent px-5 py-4 pr-16 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <Button
              size="icon"
              className="absolute right-3 bottom-3 size-10 rounded-xl"
              onClick={submit}
              disabled={!input.trim()}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to send · <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for a new line
          </p>
        </div>

        <div className="mb-8 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-2.5 rounded-xl border bg-card p-4 transition-colors duration-200 hover:bg-card/80"
            >
              <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
                <Icon className="size-4 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-3xl">
          <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Try one of these examples</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setInput(prompt);
                  textareaRef.current?.focus();
                }}
                className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-foreground transition-colors duration-150 hover:bg-muted/50"
              >
                <ChevronRightIcon className="size-3 text-muted-foreground" />
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage(): JSX.Element {
  const { ready, signedIn, run, isLoading: agentLoading } = useAgentRuntime();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState<AgentMessage["parts"][number]["plan"] | null>(null);
  const [assembly, setAssembly] = useState<SequencedAchievementProgress | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(INITIAL_STEPS);
  const [showExecutionSteps, setShowExecutionSteps] = useState(false);
  const [lastFailed, setLastFailed] = useState(0);

  const busy = isLoading || agentLoading;

  const handleSubmit = useCallback(
    async (text: string) => {
      const prompt = text.trim();
      if (!prompt || busy) return;
      if (!signedIn) {
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "user",
            parts: [{ type: "text", text: prompt }],
          },
          {
            id: uuidv4(),
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "Please sign in so I can read your workspace and apply changes.",
              },
            ],
          },
        ]);
        return;
      }
      if (!ready) return;

      const userMessage: AgentMessage = {
        id: uuidv4(),
        role: "user",
        parts: [{ type: "text", text: prompt }],
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setAssembly(null);
      setShowExecutionSteps(true);
      setExecutionSteps(
        INITIAL_STEPS.map((step, i) => ({
          ...step,
          status: i === 0 ? "active" : "pending",
        }))
      );
      setLastFailed(0);

      try {
        setExecutionSteps((prev) =>
          prev.map((step, i) =>
            i === 0
              ? { ...step, status: "complete" }
              : i === 1
                ? { ...step, status: "active" }
                : step
          )
        );

        const result = await run(prompt);

        setExecutionSteps((prev) =>
          prev.map((step, i) =>
            i <= 2
              ? { ...step, status: "complete" }
              : i === 3
                ? { ...step, status: "active" }
                : step
          )
        );

        const uiPlan = result.preview ? toUiPlan(result.preview) : null;
        if (uiPlan) setPlanData(uiPlan);

        const failNote =
          result.failed.length > 0
            ? `\n\n_${result.failed.length} action(s) failed — check details in the response._`
            : "";

        const assistantMessage: AgentMessage = {
          id: uuidv4(),
          role: "assistant",
          parts: [
            { type: "text", text: `${result.message}${failNote}` },
            ...(uiPlan ? [{ type: "plan" as const, plan: uiPlan }] : []),
          ],
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLastFailed(result.failed.length);
        setExecutionSteps((prev) =>
          prev.map((step) => ({ ...step, status: "complete" as const }))
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            parts: [{ type: "text", text: `**Error:** ${message}` }],
          },
        ]);
      } finally {
        setIsLoading(false);
        setShowExecutionSteps(false);
      }
    },
    [busy, ready, run, signedIn]
  );

  if (messages.length === 0 && !busy) {
    return (
      <React.Suspense fallback={null}>
        <AgentEmptyState onSubmit={handleSubmit} />
      </React.Suspense>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel defaultSize="30%" minSize="20%" maxSize="40%" className="min-w-0">
          <AgentSidebar
            messages={messages}
            onSubmit={handleSubmit}
            isLoading={busy}
            planData={planData}
            onAssembly={setAssembly}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-gradient-to-b from-transparent via-border to-transparent" />

        <ResizablePanel minSize="60%" className="min-w-0 flex flex-col">
          <PlanPreviewPanel
            planData={planData}
            assembly={assembly}
            executionSteps={executionSteps}
            showExecutionSteps={showExecutionSteps && busy}
            isGenerating={busy}
            appliedNote={
              lastFailed > 0
                ? `${lastFailed} action(s) failed`
                : "Workspace updated"
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// ============================================================================
// Preview Panel
// ============================================================================

function PlanPreviewPanel({
  planData,
  assembly,
  executionSteps,
  showExecutionSteps,
  isGenerating,
  appliedNote,
}: {
  planData: AgentMessage["parts"][number]["plan"] | null;
  assembly: SequencedAchievementProgress | null;
  executionSteps: Array<{ label: string; status: "pending" | "active" | "complete"; description?: string }>;
  showExecutionSteps: boolean;
  isGenerating: boolean;
  appliedNote?: string;
}) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <CheckIcon className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Live preview</h1>
            <p className="text-xs text-muted-foreground">
              {planData
                ? `${planData.phases.length} phases · ${planData.phases.reduce((acc, p) => acc + p.tasks.length, 0)} tasks`
                : "Waiting for plan generation…"}
              {appliedNote && planData ? ` · ${appliedNote}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5" asChild>
            <a href="/workspace/projects">
              <DownloadIcon className="size-3.5" />
              <span className="hidden sm:inline">Open projects</span>
            </a>
          </Button>
          <Button variant="default" size="sm" className="gap-1.5" disabled>
            <PlusIcon className="size-3.5" />
            <span className="hidden sm:inline">
              {planData ? "Saved via agent" : "Save to Workspace"}
            </span>
          </Button>
        </div>
      </div>

      {/* Execution Steps During Generation */}
      {showExecutionSteps && (
        <div className="border-b border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <Loader2Icon className="size-4 animate-spin text-primary" />
            <span>Generating your plan...</span>
          </div>
          <TaskExecutionSteps steps={executionSteps} />
        </div>
      )}

      {/* Plan Preview Content */}
      <div className="flex-1 overflow-auto px-6 py-6 sm:px-10">
        {planData && assembly ? (
          <PlanPreviewView plan={planData} isPreview assembly={assembly} />
        ) : planData ? (
          <div className="flex h-full items-center justify-center">
            <GenerationStatus />
          </div>
        ) : isGenerating ? (
          <PlanPreviewSkeleton />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
              <Layers className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Nothing in preview yet</h2>
            <p className="text-muted-foreground max-w-xs">
              Start a conversation on the left to build a roadmap, habit plan, or deadline schedule for your workspace.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded border">Try: &quot;Create a 2-month DSA plan&quot;</kbd>
              <kbd className="px-2 py-1 bg-muted rounded border">Try: &quot;Add a daily reading habit&quot;</kbd>
              <kbd className="px-2 py-1 bg-muted rounded border">Try: &quot;Break my project into phases&quot;</kbd>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Plan Preview Skeleton
// ============================================================================

function PlanPreviewSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card/40 p-6 animate-pulse">
        <div className="h-4 w-3/4 bg-muted rounded mb-4" />
        <div className="h-4 w-1/2 bg-muted rounded mb-2" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-border/80 bg-card/40 p-6 animate-pulse">
          <div className="h-5 w-1/3 bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="size-5 rounded-md bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded mb-1" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

