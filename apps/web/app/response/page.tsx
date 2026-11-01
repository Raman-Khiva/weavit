import { MessageResponse } from "@workspace/ui/components/ai-elements/message";


const agentReplyMarkdown1 = `## Today's focus

You're in good shape — **3 items need attention** before EOD.

### Urgent deadlines

| Deadline | Due | Priority | Status |
| --- | --- | --- | --- |
| Math Quiz | Today · 2:00 PM | **HIGH** | Pending |
| Reading Assignment | Today · 5:00 PM | LOW | Pending |
| Add authentication | Oct 23 | HIGH | Overdue |

### Pending from plans

1. **Trees & BST: BFS, DFS, LCA** — *SDE Interview Prep* · In progress
2. **Reply to the recruiter** — *Job search* · Pending
3. **Create API endpoints** — *Weavit v1* · Medium

### Habits still open

- [ ] Reading (9-day streak)
- [x] Exercise — done today
- [ ] Drink water

### Suggested next move

> Start with **Math Quiz** (due in ~2h), then log **Reading** to keep the streak.

[Deadlines](/workspace/deadlines) · [Habits](/workspace/habits) · [Plans](/workspace/projects)
`

// usage
// <MessageResponse className="prose prose-sm dark:prose-invert max-w-none">
//   {agentReplyMarkdown}
// </MessageResponse>
const agentReplyMarkdown = `## Today's focus

You're in good shape — **3 items need attention** before EOD.

### Urgent deadlines

| Deadline | Due | Priority | Status |
| --- | --- | --- | --- |
| Math Quiz | Today · 2:00 PM | **HIGH** | Pending |
| Reading Assignment | Today · 5:00 PM | LOW | Pending |
| Add authentication | Oct 23 | HIGH | Overdue |

### Pending from plans

1. **Trees & BST: BFS, DFS, LCA** — *SDE Interview Prep* · In progress
2. **Reply to the recruiter** — *Job search* · Pending
3. **Create API endpoints** — *Weavit v1* · Medium

### Habits still open

- [ ] Reading (9-day streak)
- [x] Exercise — done today
- [ ] Drink water

### Suggested next move

> Start with **Math Quiz** (due in ~2h), then log **Reading** to keep the streak.

[Deadlines](/workspace/deadlines) · [Habits](/workspace/habits) · [Plans](/workspace/projects)
`

// usage
// <MessageResponse className="prose prose-sm dark:prose-invert max-w-none">
//   {agentReplyMarkdown}
// </MessageResponse>const md = "## Todays focus 


const agentReplyMarkdown2 = `## Good afternoon, Raman

Here’s your **workspace snapshot** for Saturday, Oct 31 — prioritized so you can move without overthinking.

---

### At a glance

| Area | Count | Signal |
| --- | ---: | --- |
| Urgent deadlines (today) | **2** | Act before 5 PM |
| Overdue | **1** | Unblock tomorrow’s plan |
| Open todos | **4** | 1 in progress |
| Habits left today | **2 / 4** | Streak risk on Reading |
| Active roadmaps | **2** | Next tasks ready |

---

### 1. Deadlines that matter today

| Item | Window | Priority | Why it matters |
| --- | --- | --- | --- |
| **Math Quiz** | Today · **2:00–3:00 PM** | **URGENT** | Fixed slot — prep now or you lose the block |
| **Reading Assignment** | Today · 5:00 PM | LOW | Soft deadline; after quiz is fine |
| **Add authentication** | Oct 23 | **HIGH · Overdue** | Blocking API work on Weavit v1 |

**Depth on Math Quiz**
- Course: CS 401 · ~45 min review recommended  
- Suggested prep: 15 min formulas → 20 min practice set → 10 min flash check  
- Related habit: *Exercise* already logged — energy is available

---

### 2. Pending from plans

#### SDE Interview Prep
1. **Trees & BST: BFS, DFS, LCA** — *In progress* · Phase: Graphs & Trees  
2. ~~Arrays & Hashing: LC 1, 49, 347~~ — completed  
3. **Sliding Window follow-ups** — *Pending* · Priority: HIGH  

#### Weavit v1
1. **Create API endpoints** — *Pending* · Priority: MEDIUM · depends on auth  
2. **Write documentation** — *Pending* · Priority: LOW  

#### Job search
1. **Reply to the recruiter** — *Pending* · Priority: HIGH · aging 2 days  

---

### 3. Todos board (open)

| Todo | Status | Priority | Tags |
| --- | --- | --- | --- |
| AI-powered search | Pending | HIGH | demo, AI |
| Custom webhooks | Pending | MEDIUM | backend |
| Real-time collaboration | **In progress** | URGENT | realtime |
| API v2 migration | In progress | HIGH | API |

---

### 4. Habits today

- [x] **Exercise** — locked in · streak **36D**  
- [ ] **Reading** — 10 pages · streak **9D** · ⚠ gap risk if skipped  
- [ ] **Drink water** — 2.5L · streak **12D**  
- [x] **Meditation** — done earlier  

Consistency so far: **50%** of daily rituals.

---

### 5. Recommended sequence (next 3 hours)

\`\`\`text
14:00  Math Quiz (hard block)
15:15  Reply to recruiter (15 min — clear HIGH aging item)
15:30  Trees & BST: finish LCA set (45–60 min)
16:30  Log Reading habit (protect 9D streak)
17:00  Reading Assignment if energy remains
\`\`\`

> **Rule for today:** protect the quiz and the Reading streak. Auth overdue can wait until after 5 PM unless you have a free 25-minute deep block.

---

### Quick links

- [Deadlines](/workspace/deadlines)  
- [Habits](/workspace/habits)  
- [Roadmaps](/workspace/projects)  
- [Todos](/workspace/todos)  
- [Open full agent (live preview)](/agent)  

---

### What I can do next

Say one of these and I’ll execute:

1. **Log Reading** for today  
2. **Mark “Reply to the recruiter” complete**  
3. **Set Trees & BST → IN_PROGRESS** with a short note  
4. **Build a 5-day quiz + DSA recovery plan** in the full agent with live preview  

Which one do you want?
`

// <MessageResponse className="prose prose-sm dark:prose-invert max-w-none max-w-2xl">
//   {agentReplyMarkdown}
// </MessageResponse>


function Page(){
    return(
        <div className="px-80">
      <MessageResponse className=" prose prose-sm dark:prose-invert ">
        {agentReplyMarkdown2}
      </MessageResponse>
</div>
    )
    
}

export default Page;