"use client";

import React from "react";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable";
import { PromptInput, PromptInputTextarea, PromptInputSubmit, PromptInputFooter, PromptInputHeader } from "@workspace/ui/components/ai-elements/prompt-input";
import { Conversation, ConversationContent } from "@workspace/ui/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@workspace/ui/components/ai-elements/message";
import { ChainOfThought, ChainOfThoughtHeader, ChainOfThoughtContent, ChainOfThoughtStep } from "@workspace/ui/components/ai-elements/chain-of-thought";
import { PlanPreview } from "@/components/agent/plan-preview";
import { GenerationStatus } from "@/components/agent/generation-status";
import { PromptInputBody, PromptInputActionMenu, PromptInputActionMenuTrigger, PromptInputActionMenuContent, PromptInputActionMenuItem } from "@workspace/ui/components/ai-elements/prompt-input";
import { SequencedAchievementList, type SequencedAchievementItem, type SequencedAchievementProgress } from "@workspace/ui/components/achievement-list";
import { CheckIcon, BotIcon, SparklesIcon, Loader2Icon, ChevronRightIcon, DownloadIcon, PlusIcon, Lightbulb, Cpu, Layers, GitBranch, Zap, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { v4 as uuidv4 } from "uuid";

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

// ============================================================================
// Mock Data - Simulated Plan Generation
// ============================================================================

const generateDSAPlan = (): AgentMessage => ({
  id: uuidv4(),
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "I'll create a comprehensive **2-Month DSA Mastery Plan** for you. This plan is structured in 4 progressive phases, taking you from fundamentals to advanced problem-solving patterns.",
    },
    {
      type: "reasoning",
      reasoning: "The user wants a 2-month DSA learning plan. I need to structure this progressively:\n\n1. **Month 1 (Weeks 1-4): Foundations & Core Patterns**\n   - Week 1: Arrays, Hash Maps, Two Pointers, Sliding Window\n   - Week 2: Linked Lists, Stacks, Queues, Strings\n   - Week 3: Trees & Graphs Basics (BFS/DFS, Binary Trees)\n   - Week 4: Recursion & Backtracking patterns\n\n2. **Month 2 (Weeks 5-8): Advanced Patterns & Mastery**\n   - Week 5: Dynamic Programming (1D, 2D, Interval, Grid)\n   - Week 6: Advanced Graphs (Dijkstra, Topo Sort, Union Find, MST)\n   - Week 7: Advanced Trees (Tries, Segment Trees, BST operations)\n   - Week 8: Mock Interviews & LeetCode 150/200 grind\n\nEach phase should have executable tasks with categories and priorities.",
    },
    {
      type: "tool-invocation",
      toolInvocation: {
        toolName: "generate_plan",
        state: "call",
        args: {
          topic: "Data Structures & Algorithms",
          duration: "2 months",
          level: "intermediate",
          focus: ["problem-solving", "interview-prep", "competitive-programming"],
        },
      },
    },
    {
      type: "tool-invocation",
      toolInvocation: {
        toolName: "generate_plan",
        state: "result",
        args: {
          topic: "Data Structures & Algorithms",
          duration: "2 months",
          level: "intermediate",
          focus: ["problem-solving", "interview-prep", "competitive-programming"],
        },
        result: {
          title: "2-Month DSA Mastery Plan",
          description: "Progressive roadmap from fundamentals to advanced interview-ready problem solving",
          phases: [
            {
              id: "phase-1",
              title: "Foundations: Arrays, Hash Maps & Linear Patterns",
              description: "Master the building blocks of algorithmic problem solving",
              category: "Week 1-2",
              status: "active",
              startDate: "Week 1",
              endDate: "Week 2",
              tasks: [
                { id: "t1", title: "Arrays & Hashing: Two Sum, Group Anagrams, Top K Frequent", description: "Master hash map lookups and frequency counting", category: "Arrays", priority: "high", status: "completed" },
                { id: "t2", title: "Two Pointers: Valid Palindrome, 3Sum, Container With Most Water", description: "Opposite-direction and same-direction pointer patterns", category: "Two Pointers", priority: "high", status: "completed" },
                { id: "t3", title: "Sliding Window: Max Subarray, Min Window Substring, Longest Substring", description: "Fixed vs variable window, expansion/contraction logic", category: "Sliding Window", priority: "high", status: "in_progress" },
                { id: "t4", title: "Prefix Sum: Subarray Sum Equals K, Range Sum Query", description: "Precomputation for O(1) range queries", category: "Prefix Sum", priority: "medium", status: "pending" },
                { id: "t5", title: "Linked Lists: Reverse, Detect Cycle, Merge Two Lists", description: "Pointer manipulation and fast/slow pointer technique", category: "Linked Lists", priority: "high", status: "pending" },
                { id: "t6", title: "Stacks & Queues: Valid Parentheses, Min Stack, Daily Temperatures", description: "Monotonic stack pattern and queue simulations", category: "Stack/Queue", priority: "high", status: "pending" },
              ],
            },
            {
              id: "phase-2",
              title: "Trees, Graphs & Recursion Fundamentals",
              description: "Hierarchical data structures and graph traversal mastery",
              category: "Week 3-4",
              status: "pending",
              startDate: "Week 3",
              endDate: "Week 4",
              tasks: [
                { id: "t7", title: "Binary Trees: BFS Level Order, DFS Pre/In/Post Order, Max Depth", description: "Recursive and iterative tree traversals", category: "Trees", priority: "high", status: "pending" },
                { id: "t8", title: "Binary Search Trees: Insert, Delete, Validate, Lowest Common Ancestor", description: "BST properties and recursive solutions", category: "BST", priority: "high", status: "pending" },
                { id: "t9", title: "Graph Basics: Adjacency List, BFS/DFS, Number of Islands", description: "Graph representation and flood fill", category: "Graphs", priority: "high", status: "pending" },
                { id: "t10", title: "Topological Sort: Course Schedule, Alien Dictionary", description: "Kahn's algorithm and DFS-based ordering", category: "Topo Sort", priority: "high", status: "pending" },
                { id: "t11", title: "Recursion & Backtracking: Subsets, Permutations, N-Queens", description: "Decision tree exploration and pruning", category: "Backtracking", priority: "medium", status: "pending" },
                { id: "t12", title: "Divide & Conquer: Merge Sort, Quick Select, Kth Largest", description: "Recurrence relations and partitioning", category: "Divide & Conquer", priority: "medium", status: "pending" },
              ],
            },
            {
              id: "phase-3",
              title: "Dynamic Programming Mastery",
              description: "From memoization to tabulation - the ultimate interview pattern",
              category: "Week 5-6",
              status: "pending",
              startDate: "Week 5",
              endDate: "Week 6",
              tasks: [
                { id: "t13", title: "1D DP: Climbing Stairs, House Robber, Coin Change", description: "State definition and transition", category: "1D DP", priority: "high", status: "pending" },
                { id: "t14", title: "2D Grid DP: Unique Paths, Min Path Sum, Edit Distance", description: "Grid traversal and string alignment", category: "2D DP", priority: "high", status: "pending" },
                { id: "t15", title: "Interval DP: Burst Balloons, Matrix Chain Multiplication", description: "Subproblem partitioning on intervals", category: "Interval DP", priority: "high", status: "pending" },
                { id: "t16", title: "Subsequence DP: LIS, LCS, Longest Palindromic Subsequence", description: "Two-sequence and single-sequence LIS", category: "Subsequence", priority: "high", status: "pending" },
                { id: "t17", title: "Knapsack Variants: 0/1, Unbounded, Multi-dimensional", description: "Capacity constraints and item selection", category: "Knapsack", priority: "medium", status: "pending" },
                { id: "t18", title: "DP on Trees: House Robber III, Binary Tree Max Path Sum", description: "Tree DP with post-order traversal", category: "Tree DP", priority: "medium", status: "pending" },
              ],
            },
            {
              id: "phase-4",
              title: "Advanced Graphs, Tries & Interview Simulation",
              description: "Advanced algorithms and full mock interview preparation",
              category: "Week 7-8",
              status: "pending",
              startDate: "Week 7",
              endDate: "Week 8",
              tasks: [
                { id: "t19", title: "Dijkstra & A*: Network Delay Time, Shortest Path in Grid", description: "Priority queue and heuristic search", category: "Shortest Path", priority: "high", status: "pending" },
                { id: "t20", title: "Union Find: Number of Islands II, Accounts Merge", description: "Disjoint set with path compression", category: "Union Find", priority: "high", status: "pending" },
                { id: "t21", title: "MST: Min Cost to Connect All Points, Critical Connections", description: "Kruskal's and Prim's algorithms", category: "MST", priority: "medium", status: "pending" },
                { id: "t22", title: "Tries: Implement Trie, Word Search II, Auto-complete", description: "Prefix tree operations and DFS on trie", category: "Tries", priority: "high", status: "pending" },
                { id: "t23", title: "Segment Tree & BIT: Range Sum Query, Count of Smaller Numbers", description: "Advanced range query data structures", category: "Advanced DS", priority: "medium", status: "pending" },
                { id: "t24", title: "Mock Interviews: LeetCode 150 Grind & Timed Sessions", description: "Simulated interview conditions with feedback", category: "Mock Interview", priority: "high", status: "pending" },
              ],
            },
          ],
        },
      },
    },
    {
      type: "plan",
      plan: {
        title: "2-Month DSA Mastery Plan",
        description: "Progressive roadmap from fundamentals to advanced interview-ready problem solving",
        phases: [
          {
            id: "phase-1",
            title: "Foundations: Arrays, Hash Maps & Linear Patterns",
            description: "Master the building blocks of algorithmic problem solving",
            category: "Week 1-2",
            status: "active",
            startDate: "Week 1",
            endDate: "Week 2",
            tasks: [
              { id: "t1", title: "Arrays & Hashing: Two Sum, Group Anagrams, Top K Frequent", description: "Master hash map lookups and frequency counting", category: "Arrays", priority: "high", status: "completed" },
              { id: "t2", title: "Two Pointers: Valid Palindrome, 3Sum, Container With Most Water", description: "Opposite-direction and same-direction pointer patterns", category: "Two Pointers", priority: "high", status: "completed" },
              { id: "t3", title: "Sliding Window: Max Subarray, Min Window Substring, Longest Substring", description: "Fixed vs variable window, expansion/contraction logic", category: "Sliding Window", priority: "high", status: "in_progress" },
              { id: "t4", title: "Prefix Sum: Subarray Sum Equals K, Range Sum Query", description: "Precomputation for O(1) range queries", category: "Prefix Sum", priority: "medium", status: "pending" },
              { id: "t5", title: "Linked Lists: Reverse, Detect Cycle, Merge Two Lists", description: "Pointer manipulation and fast/slow pointer technique", category: "Linked Lists", priority: "high", status: "pending" },
              { id: "t6", title: "Stacks & Queues: Valid Parentheses, Min Stack, Daily Temperatures", description: "Monotonic stack pattern and queue simulations", category: "Stack/Queue", priority: "high", status: "pending" },
            ],
          },
          {
            id: "phase-2",
            title: "Trees, Graphs & Recursion Fundamentals",
            description: "Hierarchical data structures and graph traversal mastery",
            category: "Week 3-4",
            status: "pending",
            startDate: "Week 3",
            endDate: "Week 4",
            tasks: [
              { id: "t7", title: "Binary Trees: BFS Level Order, DFS Pre/In/Post Order, Max Depth", description: "Recursive and iterative tree traversals", category: "Trees", priority: "high", status: "pending" },
              { id: "t8", title: "Binary Search Trees: Insert, Delete, Validate, Lowest Common Ancestor", description: "BST properties and recursive solutions", category: "BST", priority: "high", status: "pending" },
              { id: "t9", title: "Graph Basics: Adjacency List, BFS/DFS, Number of Islands", description: "Graph representation and flood fill", category: "Graphs", priority: "high", status: "pending" },
              { id: "t10", title: "Topological Sort: Course Schedule, Alien Dictionary", description: "Kahn's algorithm and DFS-based ordering", category: "Topo Sort", priority: "high", status: "pending" },
              { id: "t11", title: "Recursion & Backtracking: Subsets, Permutations, N-Queens", description: "Decision tree exploration and pruning", category: "Backtracking", priority: "medium", status: "pending" },
              { id: "t12", title: "Divide & Conquer: Merge Sort, Quick Select, Kth Largest", description: "Recurrence relations and partitioning", category: "Divide & Conquer", priority: "medium", status: "pending" },
            ],
          },
          {
            id: "phase-3",
            title: "Dynamic Programming Mastery",
            description: "From memoization to tabulation - the ultimate interview pattern",
            category: "Week 5-6",
            status: "pending",
            startDate: "Week 5",
            endDate: "Week 6",
            tasks: [
              { id: "t13", title: "1D DP: Climbing Stairs, House Robber, Coin Change", description: "State definition and transition", category: "1D DP", priority: "high", status: "pending" },
              { id: "t14", title: "2D Grid DP: Unique Paths, Min Path Sum, Edit Distance", description: "Grid traversal and string alignment", category: "2D DP", priority: "high", status: "pending" },
              { id: "t15", title: "Interval DP: Burst Balloons, Matrix Chain Multiplication", description: "Subproblem partitioning on intervals", category: "Interval DP", priority: "high", status: "pending" },
              { id: "t16", title: "Subsequence DP: LIS, LCS, Longest Palindromic Subsequence", description: "Two-sequence and single-sequence LIS", category: "Subsequence", priority: "high", status: "pending" },
              { id: "t17", title: "Knapsack Variants: 0/1, Unbounded, Multi-dimensional", description: "Capacity constraints and item selection", category: "Knapsack", priority: "medium", status: "pending" },
              { id: "t18", title: "DP on Trees: House Robber III, Binary Tree Max Path Sum", description: "Tree DP with post-order traversal", category: "Tree DP", priority: "medium", status: "pending" },
            ],
          },
          {
            id: "phase-4",
            title: "Advanced Graphs, Tries & Interview Simulation",
            description: "Advanced algorithms and full mock interview preparation",
            category: "Week 7-8",
            status: "pending",
            startDate: "Week 7",
            endDate: "Week 8",
            tasks: [
              { id: "t19", title: "Dijkstra & A*: Network Delay Time, Shortest Path in Grid", description: "Priority queue and heuristic search", category: "Shortest Path", priority: "high", status: "pending" },
              { id: "t20", title: "Union Find: Number of Islands II, Accounts Merge", description: "Disjoint set with path compression", category: "Union Find", priority: "high", status: "pending" },
              { id: "t21", title: "MST: Min Cost to Connect All Points, Critical Connections", description: "Kruskal's and Prim's algorithms", category: "MST", priority: "medium", status: "pending" },
              { id: "t22", title: "Tries: Implement Trie, Word Search II, Auto-complete", description: "Prefix tree operations and DFS on trie", category: "Tries", priority: "high", status: "pending" },
              { id: "t23", title: "Segment Tree & BIT: Range Sum Query, Count of Smaller Numbers", description: "Advanced range query data structures", category: "Advanced DS", priority: "medium", status: "pending" },
              { id: "t24", title: "Mock Interviews: LeetCode 150 Grind & Timed Sessions", description: "Simulated interview conditions with feedback", category: "Mock Interview", priority: "high", status: "pending" },
            ],
          },
        ],
      },
    },
    {
      type: "text",
      text: "Your **2-Month DSA Mastery Plan** is ready! I've structured it into 4 progressive phases with 24 executable tasks. The plan starts with foundational patterns (arrays, two pointers, sliding window) and builds up to advanced topics like dynamic programming, graph algorithms, and mock interviews.\n\n**Key Features:**\n- ✅ **24 executable tasks** with clear categories and priorities\n- 📅 **Week-by-week structure** with date ranges\n- 🎯 **Progress tracking** with status indicators\n- 🔄 **Adaptive** - you can ask me to adjust pace, add topics, or dive deeper into any area\n\nThe preview on the right shows your plan using the same components as the main app. You can ask me to:\n- **Modify** the plan (e.g., \"focus more on graphs, less on DP\")\n- **Expand** any phase with more detail\n- **Export** to your workspace as a project\n- **Start tracking** progress with notes and completion status",
    },
  ],
});

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
              placeholder={isLoading ? "Agent is thinking..." : "Describe what you want to plan..."}
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
  { label: "Understanding your goals", status: "complete", description: "Analyzing your request for a 2-month DSA plan" },
  { label: "Structuring the curriculum", status: "complete", description: "Breaking down into 4 progressive phases" },
  { label: "Generating executable tasks", status: "complete", description: "Creating 24 specific tasks with priorities" },
  { label: "Building the preview", status: "active", description: "Rendering the interactive plan preview" },
];

const FEATURE_HIGHLIGHTS = [
  {
    icon: Cpu,
    title: "AI-Powered Planning",
    description: "Intelligent project structure generation from a single prompt",
  },
  {
    icon: Layers,
    title: "Full Stack Support",
    description: "Supports any tech stack — frontend, backend, mobile, or cloud",
  },
  {
    icon: GitBranch,
    title: "Phase Breakdown",
    description: "Automatically splits work into milestones and actionable tasks",
  },
  {
    icon: Zap,
    title: "Instant Scaffolding",
    description: "Ready-to-run commands for every setup step",
  },
] as const;

const EXAMPLE_PROMPTS = [
  "A Python learning platform",
  "E-commerce store with React",
  "REST API with Node.js",
  "Mobile fitness tracker app",
];

function AgentEmptyState({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          <span className="text-sm font-semibold">weavit agent</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl border bg-card shadow-lg">
              <Lightbulb className="size-8 text-primary" />
            </div>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Hi! How can I help you today?</h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Describe any project — a SaaS app, API service, mobile app, or data pipeline — and I&apos;ll generate a full structured plan instantly.
          </p>
        </div>

        <div className="mb-8 w-full max-w-3xl">
          <div className="relative rounded-2xl border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/50">
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
              placeholder="Describe your project idea…"
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
            Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to generate · <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for a new line
          </p>
        </div>

        <div className="mb-8 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-xs"
            >
              <div className="flex size-8 items-center justify-center rounded-lg border bg-background shadow-xs">
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
                className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs text-foreground shadow-xs transition-colors hover:bg-accent"
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
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState<AgentMessage["parts"][number]["plan"] | null>(null);
  const [assembly, setAssembly] = useState<SequencedAchievementProgress | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(INITIAL_STEPS);
  const [showExecutionSteps, setShowExecutionSteps] = useState(true);

  const handleSubmit = useCallback(async (text: string) => {
    // Add user message
    const userMessage: AgentMessage = {
      id: uuidv4(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setAssembly(null);
    setShowExecutionSteps(false);

    await new Promise((resolve) => setTimeout(resolve, 280));

    const assistantMessage = generateDSAPlan();
    setMessages((prev) => [...prev, assistantMessage]);
    setPlanData(assistantMessage.parts.find((part) => part.type === "plan")?.plan ?? null);
    setIsLoading(false);
    setExecutionSteps((prev) => prev.map((step) => ({ ...step, status: "complete" as const })));
  }, []);

  if (messages.length === 0 && !isLoading) {
    return <AgentEmptyState onSubmit={handleSubmit} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Conversation Sidebar - 30% default, resizable 20-40% */}
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel defaultSize="30%" minSize="20%" maxSize="40%" className="min-w-0">
          <AgentSidebar
            messages={messages}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            planData={planData}
            onAssembly={setAssembly}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Preview Panel - 70% default */}
        <ResizablePanel minSize="60%" className="min-w-0 flex flex-col">
          <PlanPreviewPanel
            planData={planData}
            assembly={assembly}
            executionSteps={executionSteps}
            showExecutionSteps={showExecutionSteps && isLoading}
            isGenerating={isLoading}
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
}: {
  planData: AgentMessage["parts"][number]["plan"] | null;
  assembly: SequencedAchievementProgress | null;
  executionSteps: Array<{ label: string; status: "pending" | "active" | "complete"; description?: string }>;
  showExecutionSteps: boolean;
  isGenerating: boolean;
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
            <h1 className="font-semibold text-foreground">Plan Preview</h1>
            <p className="text-xs text-muted-foreground">
              {planData ? `${planData.phases.length} phases · ${planData.phases.reduce((acc, p) => acc + p.tasks.length, 0)} tasks` : "Waiting for plan generation..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="default" size="sm" className="gap-1.5">
            <PlusIcon className="size-3.5" />
            <span className="hidden sm:inline">Save to Workspace</span>
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
          <PlanPreview plan={planData} isPreview assembly={assembly} />
        ) : planData ? (
          <div className="flex h-full items-center justify-center">
            <GenerationStatus />
          </div>
        ) : isGenerating ? (
          <PlanPreviewSkeleton />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
              <SparklesIcon className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No plan generated yet</h2>
            <p className="text-muted-foreground max-w-xs">
              Start a conversation on the left to generate a learning plan, project roadmap, or study schedule.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded border">Try: "Create a 2-month DSA plan"</kbd>
              <kbd className="px-2 py-1 bg-muted rounded border">Try: "Plan a React project from scratch"</kbd>
              <kbd className="px-2 py-1 bg-muted rounded border">Try: "Design a system design study roadmap"</kbd>
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

