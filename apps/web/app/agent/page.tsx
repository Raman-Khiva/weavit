"use client";

import React from "react";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputBody,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionMenuItem,
} from "@workspace/ui/components/ai-elements/prompt-input";
import { Conversation, ConversationContent } from "@workspace/ui/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@workspace/ui/components/ai-elements/message";
import { ChainOfThought, ChainOfThoughtHeader, ChainOfThoughtContent, ChainOfThoughtStep } from "@workspace/ui/components/ai-elements/chain-of-thought";
import { PlanPreview as PlanPreviewView } from "@/components/agent/plan-preview";
import { SequencedAchievementList, type SequencedAchievementItem, type SequencedAchievementProgress } from "@workspace/ui/components/achievement-list";
import { CheckIcon, BotIcon, Loader2Icon, ChevronRightIcon, DownloadIcon, PlusIcon, Target, Layers, CalendarClock, ClipboardCheck, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAgentRuntime } from "@/features/agent/use-agent-runtime";
import type {
  ActionItem,
  PlanPreview as AgentPlanPreview,
} from "@/features/agent/schema.agent";
import type { AgentWorkspaceState } from "@/features/agent/actions.agent";
import { ActionCard } from "@/features/agent/ActionCard";
import { WeavitLogo } from "@workspace/ui/components/weavit-logo";

const AGENT_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workspace", label: "Workspace" },
  { href: "/workspace/projects", label: "Plans" },
  { href: "/workspace/habits", label: "Habits" },
  { href: "/workspace/timeline", label: "Timeline" },
] as const;

function AgentTopBar({
  subtitle,
  signedIn,
}: {
  subtitle: string
  signedIn?: boolean
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link href="/dashboard" className="shrink-0">
          <WeavitLogo
            alt="Weavit"
            className="size-8 rounded-xl sm:size-9"
          />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-foreground">
            weavit agent
          </h1>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <nav className="hidden items-center gap-0.5 sm:flex sm:gap-1">
          {AGENT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:px-2.5 sm:text-xs"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {signedIn === false ? (
          <Link
            href="/login"
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            Sign in
          </Link>
        ) : null}
      </div>
    </header>
  );
}

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
  actions?: ActionItem[];
  failedActionIndexes?: number[];
  failureReasons?: Record<number, string>;
  /** Guest mode: show Sign in CTA under the reply */
  needsLogin?: boolean;
}

type PlaybackStage = "thoughts" | "collapse" | "message" | "cards" | "closing" | "done";

const ASSISTANT_PROSE =
  "prose prose-2xl dark:prose-invert max-w-2xl leading-relaxed text-foreground/85 " +
  "prose-p:my-5 prose-p:leading-9 prose-p:text-foreground/85 " +
  "prose-ul:my-6 prose-ul:space-y-3.5 prose-li:my-2 prose-li:leading-9 prose-li:text-foreground/85 " +
  "prose-ol:my-6 prose-ol:space-y-3.5 " +
  "prose-headings:mb-3 prose-headings:mt-7 prose-headings:leading-snug prose-headings:text-foreground " +
  "prose-strong:font-bold prose-strong:text-foreground " +
  "prose-a:font-semibold prose-a:text-emerald-400 prose-a:no-underline prose-a:underline-offset-4 " +
  "hover:prose-a:text-emerald-300 hover:prose-a:underline";

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
    <MessageResponse className={ASSISTANT_PROSE}>
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
  workspaceState,
}: {
  message: AgentMessage;
  onAssembly?: (state: SequencedAchievementProgress) => void;
  workspaceState: AgentWorkspaceState;
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

  const actions = message.actions ?? [];
  const failedIndexes = message.failedActionIndexes ?? [];
  const failureReasons = message.failureReasons ?? {};

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
  const showActions = showMessage && actions.length > 0;

  return (
    <Message from="assistant">
      <MessageContent className="w-full max-w-2xl gap-1">
        {thoughts.length > 0 && (
          <ChainOfThought open={chainOpen} onOpenChange={setChainOpen} className="mb-5">
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

        {showActions ? (
          <div className="mt-6 flex flex-col gap-2.5">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Actions
              {failedIndexes.length > 0
                ? ` · ${failedIndexes.length} failed`
                : " · applied"}
            </p>
            {actions.map((action, i) => (
              <ActionCard
                key={`${message.id}-${action.actionType}-${i}`}
                action={action}
                state={workspaceState}
                failed={failedIndexes.includes(i)}
                reason={failureReasons[i]}
              />
            ))}
          </div>
        ) : null}

        {showCards && cards.length > 0 && (
          <div className="mt-6">
            <SequencedAchievementList
              items={cards}
              durationMs={4200}
              onProgress={onAssembly}
              onComplete={() => setStage(nextStage(intro, cards, closingText, "cards"))}
            />
          </div>
        )}

        {showClosing && closingText && (
          <div className="mt-5">
            <RevealedText
              text={closingText}
              active={stage === "closing"}
              onComplete={() => setStage("done")}
            />
          </div>
        )}

        {showMessage && message.needsLogin ? (
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-base font-semibold text-emerald-400 underline-offset-4 transition-colors hover:text-emerald-300 hover:underline"
            >
              Sign in to continue
            </Link>
          </div>
        ) : null}
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
// Agent Sidebar (Conversation)
// ============================================================================

function AgentSidebar({
  messages,
  onSubmit,
  isLoading,
  onAssembly,
  workspaceState,
  layout = "split",
  signedIn,
}: {
  messages: AgentMessage[];
  onSubmit: (text: string) => void;
  isLoading: boolean;
  onAssembly?: (state: SequencedAchievementProgress) => void;
  workspaceState: AgentWorkspaceState;
  /** full = no preview panel; chat owns the whole viewport */
  layout?: "full" | "split";
  signedIn?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");
  const isFull = layout === "full";

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
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-col bg-background",
        !isFull && "border-r border-border"
      )}
    >
      <AgentTopBar
        subtitle={
          signedIn === false
            ? "Guest guide · ask about Weavit"
            : "Your AI planning assistant"
        }
        signedIn={signedIn}
      />

      <Conversation className="min-h-0 flex-1">
        <ConversationContent
          className={cn(
            "gap-8 py-6",
            isFull && "mx-auto w-full max-w-3xl px-4 sm:px-6"
          )}
        >
          {messages.length === 0 ? null : (
            <>
              {messages.map((message) =>
                message.role === "user" ? (
                  <UserMessageBubble key={message.id} message={message} />
                ) : (
                  <AgentMessageBubble
                    key={message.id}
                    message={message}
                    workspaceState={workspaceState}
                    onAssembly={
                      message.id === messages[messages.length - 1]?.id
                        ? onAssembly
                        : undefined
                    }
                  />
                )
              )}
              {isLoading && <TypingIndicator />}
            </>
          )}
        </ConversationContent>
      </Conversation>

      <div className="bg-background/95 px-4 pb-4 pt-2 backdrop-blur">
        <div className={cn(isFull && "mx-auto w-full max-w-3xl")}>
          <PromptInput
            onSubmit={handleSubmit}
            className="[&_[data-slot=input-group]]:rounded-2xl"
          >
            <PromptInputBody>
              <PromptInputTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isLoading
                    ? "Agent is thinking..."
                    : "Ask about roadmaps, habits, todos, or deadlines…"
                }
                disabled={isLoading}
              />
            </PromptInputBody>
            <PromptInputFooter className="justify-between">
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger>
                    <PlusIcon className="size-4" />
                  </PromptInputActionMenuTrigger>
                  <PromptInputActionMenuContent>
                    <PromptInputActionMenuItem>Attach File</PromptInputActionMenuItem>
                    <PromptInputActionMenuItem>Take Screenshot</PromptInputActionMenuItem>
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit
                status={isLoading ? "streaming" : "ready"}
                variant="default"
                size="icon-sm"
              >
                <ChevronRightIcon className="size-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Agent Page
// ============================================================================

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

const GUEST_EXAMPLE_PROMPTS = [
  "What is Weavit?",
  "What can the agent do after I sign in?",
  "How do roadmaps and live preview work?",
  "How should I get started?",
];

function AgentEmptyState({
  onSubmit,
  canAutoSend,
  signedIn,
}: {
  onSubmit: (text: string) => void;
  canAutoSend: boolean;
  signedIn?: boolean;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const seeded = useRef(false);
  const autoSent = useRef(false);

  useEffect(() => {
    const fromQuery = searchParams.get("prompt")?.trim();
    if (!fromQuery || seeded.current) return;
    seeded.current = true;
    setInput(fromQuery);
  }, [searchParams]);

  // Landing / deep-link: ?prompt=…&autosend=1 → send once workspace (or guest path) is ready
  useEffect(() => {
    const fromQuery = searchParams.get("prompt")?.trim();
    const wantAuto = searchParams.get("autosend") === "1";
    if (!fromQuery || !wantAuto || !canAutoSend || autoSent.current) return;
    autoSent.current = true;
    onSubmit(fromQuery);
  }, [searchParams, canAutoSend, onSubmit]);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    onSubmit(text);
  };

  return (
    <div className="flex h-screen flex-col text-foreground">
      <AgentTopBar
        subtitle={
          signedIn === false
            ? "Guest guide · ask what Weavit is"
            : "Full agent · live workspace preview"
        }
        signedIn={signedIn}
      />

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl border bg-card shadow-xs">
              <BotIcon className="size-8 text-primary" />
            </div>
          </div>
          <p className="rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {signedIn === false
              ? "No account needed · ask about Weavit"
              : "Same agent as the dashboard drawer · plus live preview"}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {signedIn === false ? "Curious about Weavit?" : "What should we work on?"}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {signedIn === false
              ? "Chat about the product and how the agent works. Sign in when you want it to update your real workspace."
              : "Build roadmaps with a live preview, scaffold habits and deadlines, then keep chatting. Quick check-ins can stay on the dashboard drawer."}
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
            {(signedIn === false ? GUEST_EXAMPLE_PROMPTS : EXAMPLE_PROMPTS).map(
              (prompt) => (
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
            )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage(): JSX.Element {
  const {
    ready,
    signedIn,
    authLoaded,
    run,
    runGuest,
    savePreviewToWorkspace,
    workspaceState,
    isLoading: agentLoading,
  } = useAgentRuntime();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState<AgentMessage["parts"][number]["plan"] | null>(null);
  const [rawPreview, setRawPreview] = useState<AgentPlanPreview | null>(null);
  const [assembly, setAssembly] = useState<SequencedAchievementProgress | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const busy = isLoading || agentLoading;
  const showPreview = Boolean(planData);

  const handleSubmit = useCallback(
    async (text: string) => {
      const prompt = text.trim();
      if (!prompt || busy) return;

      // Guest product guide — conversation only, no workspace mutations
      if (authLoaded && !signedIn) {
        const history = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.parts
              .filter((p) => p.type === "text" && p.text)
              .map((p) => p.text!)
              .join("\n"),
          }));

        const userMessage: AgentMessage = {
          id: uuidv4(),
          role: "user",
          parts: [{ type: "text", text: prompt }],
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setPlanData(null);
        setRawPreview(null);

        try {
          const result = await runGuest(prompt, history);
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              parts: [{ type: "text", text: result.message }],
              needsLogin: result.needsLogin,
            },
          ]);
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
        }
        return;
      }

      if (!signedIn || !ready) return;

      const userMessage: AgentMessage = {
        id: uuidv4(),
        role: "user",
        parts: [{ type: "text", text: prompt }],
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setAssembly(null);
      // Hide artifact until a new preview arrives (Claude-style)
      setPlanData(null);
      setRawPreview(null);
      setSaved(false);
      setSaveError(null);

      try {
        const result = await run(prompt);

        const uiPlan = result.preview ? toUiPlan(result.preview) : null;
        if (uiPlan && result.preview) {
          setPlanData(uiPlan);
          setRawPreview(result.preview);
          setSaved(false);
        }

        // Don't show plan-seed actions as "executed" — those stay preview-only
        const planSeed = new Set([
          "create_project",
          "create_phase",
          "create_task",
        ]);
        const displayActions = result.actions.filter(
          (a) => !planSeed.has(a.actionType)
        );
        const failedIndexes: number[] = [];
        const failureReasons: Record<number, string> = {};
        for (const f of result.failed) {
          const idx = displayActions.indexOf(f.action);
          if (idx >= 0) {
            failedIndexes.push(idx);
            failureReasons[idx] = f.message;
          }
        }

        const previewHint =
          uiPlan && result.failed.length === 0
            ? "\n\n_Preview ready on the right — click **Add to workspace** when you want it saved._"
            : "";

        const assistantMessage: AgentMessage = {
          id: uuidv4(),
          role: "assistant",
          parts: [
            { type: "text", text: `${result.message}${previewHint}` },
            ...(uiPlan ? [{ type: "plan" as const, plan: uiPlan }] : []),
          ],
          actions: displayActions,
          failedActionIndexes: failedIndexes,
          failureReasons,
        };
        setMessages((prev) => [...prev, assistantMessage]);
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
      }
    },
    [authLoaded, busy, messages, ready, run, runGuest, signedIn]
  );

  const handleSave = useCallback(async () => {
    if (!rawPreview || saving || saved) return;
    setSaving(true);
    setSaveError(null);
    try {
      await savePreviewToWorkspace(rawPreview);
      setSaved(true);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `Saved **${rawPreview.title}** to your workspace with ${rawPreview.phases.length} phase(s).`,
            },
          ],
        },
      ]);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save plan"
      );
    } finally {
      setSaving(false);
    }
  }, [rawPreview, savePreviewToWorkspace, saved, saving]);

  // Guests chat as soon as Clerk loads; signed-in waits for workspace.
  const canAutoSend = authLoaded && (!signedIn || ready);

  if (messages.length === 0 && !busy) {
    return (
      <React.Suspense fallback={null}>
        <AgentEmptyState
          onSubmit={handleSubmit}
          canAutoSend={canAutoSend}
          signedIn={signedIn}
        />
      </React.Suspense>
    );
  }

  // No preview at all → do not mount a right pane / resizer (no reserved empty space)
  if (!showPreview) {
    return (
      <div className="h-screen w-full overflow-hidden">
        <AgentSidebar
          messages={messages}
          onSubmit={handleSubmit}
          isLoading={busy}
          onAssembly={setAssembly}
          workspaceState={workspaceState}
          layout="full"
          signedIn={signedIn}
        />
      </div>
    );
  }

  // Preview present → 50/50, chat shrinkable down to 30%
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize="50%" minSize="30%" maxSize="70%" className="min-w-0">
          <AgentSidebar
            messages={messages}
            onSubmit={handleSubmit}
            isLoading={busy}
            onAssembly={setAssembly}
            workspaceState={workspaceState}
            layout="split"
            signedIn={signedIn}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border" />

        <ResizablePanel defaultSize="50%" minSize="30%" className="min-w-0">
          <PlanPreviewPanel
            planData={planData}
            assembly={assembly}
            onSave={() => void handleSave()}
            saving={saving}
            saved={saved}
            saveError={saveError}
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
  onSave,
  saving,
  saved,
  saveError,
}: {
  planData: AgentMessage["parts"][number]["plan"] | null;
  assembly: SequencedAchievementProgress | null;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  saveError: string | null;
}) {
  if (!planData) return null;

  const taskCount = planData.phases.reduce((acc, p) => acc + p.tasks.length, 0);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {planData.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {planData.phases.length} phases · {taskCount} tasks
            {saved ? " · saved" : " · draft preview"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5" asChild>
            <a href="/workspace/projects">
              <DownloadIcon className="size-3.5" />
              <span className="hidden sm:inline">Projects</span>
            </a>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            disabled={saving || saved}
            onClick={onSave}
          >
            {saving ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : saved ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <PlusIcon className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {saved ? "Added" : saving ? "Adding…" : "Add to workspace"}
            </span>
          </Button>
        </div>
      </div>

      {saveError ? (
        <p className="border-b border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          {saveError}
        </p>
      ) : null}

      <div className="flex-1 overflow-auto px-5 py-5 sm:px-8">
        <PlanPreviewView
          plan={planData}
          isPreview
          assembly={
            assembly ?? {
              index: planData.phases.length,
              progress: 100,
              settledCount: planData.phases.length + 1,
            }
          }
        />
      </div>
    </div>
  );
}

