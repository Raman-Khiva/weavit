"use client";

import React from "react";
import { useState, useCallback, useMemo } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@workspace/ui/components/resizable";
import { PromptInput, PromptInputTextarea, PromptInputSubmit, PromptInputFooter, PromptInputHeader } from "@workspace/ui/components/ai-elements/prompt-input";
import { Conversation, ConversationContent, ConversationEmptyState } from "@workspace/ui/components/ai-elements/conversation";
import { Message, MessageContent } from "@workspace/ui/components/ai-elements/message";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";

import { ChainOfThought, ChainOfThoughtHeader, ChainOfThoughtContent, ChainOfThoughtStep } from "@workspace/ui/components/ai-elements/chain-of-thought";
import { Shimmer } from "@workspace/ui/components/ai-elements/shimmer";
import { PlanPreview } from "@/components/agent/plan-preview";
import { PromptInputBody, PromptInputActionMenu, PromptInputActionMenuTrigger, PromptInputActionMenuContent, PromptInputActionMenuItem } from "@workspace/ui/components/ai-elements/prompt-input";
import { CheckIcon, BotIcon, SparklesIcon, Loader2Icon, ChevronRightIcon, XIcon, DownloadIcon, PlusIcon, BrainIcon, WrenchIcon, ClockIcon, CheckCircleIcon, CircleIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
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

interface ToolCall {
  id: string;
  toolName: string;
  args: any;
  state: "call" | "result" | "partial-call";
  result?: any;
  error?: string;
}

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
              { id: "t5", title: "Stacks & Queues: Valid Parentheses, Min Stack, Daily Temperatures", description: "Monotonic stack pattern and queue simulations", category: "Stack/Queue", priority: "high", status: "pending" },
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

// Wrapper components to fix Radix Collapsible type issue with React 19
type CollapsibleProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
};

type CollapsibleTriggerProps = {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
  [key: string]: any;
};

type CollapsibleContentProps = {
  children?: React.ReactNode;
  className?: string;
  forceMount?: boolean;
  [key: string]: any;
};

const ReasoningCollapsible = ({ children, ...props }: CollapsibleProps) => (
  // @ts-expect-error - Radix Collapsible type issue with React 19
  <Collapsible {...props}>{children}</Collapsible>
);

const ReasoningCollapsibleTrigger = ({ children, ...props }: CollapsibleTriggerProps) => (
  // @ts-expect-error - Radix CollapsibleTrigger type issue with React 19
  <CollapsibleTrigger {...props}>{children}</CollapsibleTrigger>
);

const ReasoningCollapsibleContent = ({ children, ...props }: CollapsibleContentProps) => (
  // @ts-expect-error - Radix CollapsibleContent type issue with React 19
  <CollapsibleContent {...props}>{children}</CollapsibleContent>
);

// ============================================================================
// Message Components
// ============================================================================

function AgentMessageBubble({ message }: { message: AgentMessage }) {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Extract tool calls from message parts
  useMemo(() => {
    const calls: ToolCall[] = [];
    message.parts.forEach((part) => {
      if (part.type === "tool-invocation" && part.toolInvocation) {
        calls.push({
          id: part.toolInvocation.toolName + "-" + Math.random(),
          toolName: part.toolInvocation.toolName,
          args: part.toolInvocation.args,
          state: part.toolInvocation.state,
          result: part.toolInvocation.result,
        });
      }
    });
    setToolCalls(calls);
  }, [message.parts]);

  return (
    <Message from="assistant">
      <MessageContent>
        {message.parts.map((part, index) => {
          if (part.type === "text" && part.text) {
            return (
              <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
                <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{part.text}</div>
              </div>
            );
          }

          if (part.type === "reasoning" && part.reasoning) {
            return (
              <ReasoningCollapsible key={index} defaultOpen className="not-prose mb-4">
                <ReasoningCollapsibleTrigger className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground">
                  <BrainIcon className="size-4" />
                  <span>Chain of Thought</span>
                  <ChevronDownIcon className="ml-auto size-4 transition-transform data-[state=open]:rotate-180" />
                </ReasoningCollapsibleTrigger>
                <ReasoningCollapsibleContent className="mt-4 text-sm text-muted-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 p-3 rounded-md">{part.reasoning}</pre>
                </ReasoningCollapsibleContent>
              </ReasoningCollapsible>
            );
          }

          if (part.type === "tool-invocation" && part.toolInvocation) {
            const tool = part.toolInvocation;
            const isComplete = tool.state === "result";
            const isError = tool.result?.error;

            return (
              <div key={index} className="group not-prose mb-4 w-full rounded-md border">
                <div className="flex w-full items-center justify-between gap-4 p-3">
                  <div className="flex items-center gap-2">
                    <WrenchIcon className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{tool.toolName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
                      {isComplete ? (
                        <>
                          <CheckCircleIcon className="size-4 text-green-600" />
                          Completed
                        </>
                      ) : tool.state === "call" ? (
                        <>
                          <ClockIcon className="size-4 animate-pulse" />
                          Running
                        </>
                      ) : (
                        <>
                          <CircleIcon className="size-4" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>
                  <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </div>
                <div className="data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 space-y-4 p-4 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in">
                  <div className="space-y-2 overflow-hidden">
                    <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Parameters</h4>
                    <div className="rounded-md bg-muted/50">
                      <pre className="p-3 text-xs overflow-x-auto">{JSON.stringify(tool.args, null, 2)}</pre>
                    </div>
                  </div>
                  {isComplete && (tool.result || tool.result?.error) && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        {tool.result?.error ? "Error" : "Result"}
                      </h4>
                      <div className={cn(
                        "overflow-x-auto rounded-md text-xs [&_table]:w-full",
                        tool.result?.error
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted/50 text-foreground"
                      )}>
                        {tool.result?.error && <div>{tool.result.error}</div>}
                        {!tool.result?.error && tool.result && (
                          <pre className="p-3 text-xs overflow-x-auto">{JSON.stringify(tool.result, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (part.type === "plan" && part.plan) {
            // Plan is shown in the right preview panel, not in conversation
            return null;
          }

          return null;
        })}
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
              <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
                <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{part.text}</div>
              </div>
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
}: {
  messages: AgentMessage[];
  onSubmit: (text: string) => void;
  isLoading: boolean;
  planData?: AgentMessage["parts"][number]["plan"] | null;
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
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <SparklesIcon className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Agent</h1>
            <p className="text-xs text-muted-foreground">Your AI planning assistant</p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <SparklesIcon className="size-6 text-primary" />
                </div>
              }
              title="Start a conversation"
              description="Ask me to create a learning plan, project roadmap, or study schedule"
            />
          ) : (
            <>
              {messages.map((message) =>
                message.role === "user" ? (
                  <UserMessageBubble key={message.id} message={message} />
                ) : (
                  <AgentMessageBubble key={message.id} message={message} />
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

export default function AgentPage(): JSX.Element {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState<AgentMessage["parts"][number]["plan"] | null>(null);
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
    setShowExecutionSteps(true);
    setExecutionSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as const })));

    // Simulate streaming response with steps
    const stepLabels = [
      "Understanding your goals",
      "Structuring the curriculum",
      "Generating executable tasks",
      "Building the preview",
    ];

    for (let i = 0; i < stepLabels.length; i++) {
      setExecutionSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "active" as const } : idx < i ? { ...s, status: "complete" as const } : s
        )
      );
      await new Promise((r) => setTimeout(r, 800));
    }

    // Generate the plan
    const assistantMessage = generateDSAPlan();
    setMessages((prev) => [...prev, assistantMessage]);
    setPlanData(assistantMessage.parts.find((p) => p.type === "plan")?.plan ?? null);
    setIsLoading(false);
    setShowExecutionSteps(false);

    // Mark all steps complete
    setExecutionSteps((prev) => prev.map((s) => ({ ...s, status: "complete" as const })));
  }, []);

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
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Preview Panel - 70% default */}
        <ResizablePanel minSize="60%" className="min-w-0 flex flex-col">
          <PlanPreviewPanel
            planData={planData}
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
  executionSteps,
  showExecutionSteps,
  isGenerating,
}: {
  planData: AgentMessage["parts"][number]["plan"] | null;
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
      <div className="flex-1 overflow-auto p-4">
        {planData ? (
          <PlanPreview plan={planData} isPreview={true} />
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
    <div className="space-y-4 max-w-2xl mx-auto">
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

