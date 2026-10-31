"use client"
import Groq from 'groq-sdk'
import {
  AgentInput,
  AgentRunModal,
  useAgentRun,
} from "@workspace/ui/components/agent-run"
import { useCallback } from "react"
import { useGetProjectsQuery, usePatchTaskMutation, usePostNoteMutation } from "../projects/projects.api"
import { useAuth } from "@clerk/nextjs"
import { useGetHabitsQuery, usePostHabitLogMutation } from "../habits/habits.api"
import z from 'zod/v3'
import {zodToJsonSchema} from 'zod-to-json-schema'
import { ActionsListSchema,ActionItemSchema,ActionItem } from './schema.agent'
import { userPrompot } from './prompt.agent'


const groq = new Groq({dangerouslyAllowBrowser : true, apiKey : 
   process.env.GROQ_API_KEY
 });

const AgentContainer = () => {

const { isLoaded, isSignedIn} = useAuth();
  const {data : habits, isLoading : loadingHabitsData} = useGetHabitsQuery(undefined,{skip : !isLoaded || !isSignedIn});
  const {data : plans, isLoading : loadingPlansData} = useGetProjectsQuery(undefined,{skip : !isLoaded || !isSignedIn});

  const [postHabitLog] = usePostHabitLogMutation();
  const [patchTask] = usePatchTaskMutation();
  const [postTaskLog] = usePostNoteMutation();

  // flattened data
  const flatHabits = habits?.map(habit => ({habitId : habit.id, habitTitle : habit.title})) ?? [];
  const flatPlans = plans?.map(plan => ({
     id : plan.id,
     title : plan.title,
    description : plan.description,
    phases : plan.phases?.map(phase=>({
        phaseId : phase.id,
        title : phase.title,
        tasks : phase.tasks?.map(task => ({
            taskId : task.id,
            title : task.title,
            description : task.description,
            status : task.status
        }))??[],
    }))??[],
  }))??[];

  const findHabitTitle = (habitId: string) =>
    flatHabits.find((h) => h.habitId === habitId)?.habitTitle

  const findTaskMeta = (taskId: string) => {
    for (const plan of flatPlans) {
      for (const phase of plan.phases) {
        const task = phase.tasks.find((t) => t.taskId === taskId)
        if (task) {
          return {
            title: task.title,
            projectId: plan.id,
            phaseId: phase.phaseId,
          }
        }
      }
    }
    return null
  }

  const plan = useCallback(async (prompt: string) => {
    alert("Submitting message:" + prompt) 
    
    
 

     // llm call
    const response = await groq.chat.completions.create({
      //current model
        model : "openai/gpt-oss-120b",
        //messagews
        messages : [

          //system prompt
          userPrompot,


          //user prompt
          {
            role: "user" as const,
            content: JSON.stringify({
              trigger:prompt,
              // keys must match the system prompt (state.habits / state.plans)
              state: { habits: flatHabits, plans: flatPlans },
            }),
          },
        ],
        //output schema
        response_format : {
           type : 'json_schema',
           json_schema : {
            name : "action_list",
            schema : zodToJsonSchema(ActionsListSchema, { $refStrategy: "none" })
           }
        }
    }) 



    //handle raw output
    const rawOutputMessage = response?.choices?.[0]?.message.content!

    alert(`Agent Ouptput Message + ${rawOutputMessage}`);
    console.log(`Agent Output Message ${rawOutputMessage}`)

    // parse raw output
    let plannedActions: unknown;
    try {
      plannedActions = JSON.parse(rawOutputMessage);
    } catch {
      alert("planned actions didn't parse well");
      throw new SyntaxError("planned actions didn't parse well");
    }

    // validated output againt zod schema
    const validatedPlannedActions = ActionsListSchema.safeParse(plannedActions);

    if(!validatedPlannedActions.success){
      alert("Failed to validate planned actions list");
      throw validatedPlannedActions.error;
    }

    //return actions successfully
    return validatedPlannedActions.data.actions;

  }, [flatHabits, flatPlans])

  const describe = useCallback((action: ActionItem) => {
    switch (action.actionType) {
      case "create_habit_log": {
        const title = findHabitTitle(action.data.habitId)
        return {
          kind: "habit_log" as const,
          target: title ?? action.data.habitId,
          detail: action.data.notes,
          valid: Boolean(title),
        }
      }
      case "create_task_log": {
        const meta = findTaskMeta(action.data.taskId)
        return {
          kind: "task_log" as const,
          target: meta?.title ?? action.data.taskId,
          detail: action.data.text,
          valid: Boolean(meta),
        }
      }
      case "patch_task": {
        const meta = findTaskMeta(action.data.taskId)
        const statusBit = action.data.status ? ` → ${action.data.status}` : ""
        const noteBit = action.data.note ?? action.data.title ?? "Update task"
        return {
          kind: "task_update" as const,
          target: meta?.title ?? action.data.taskId,
          detail: `${noteBit}${statusBit}`,
          valid: Boolean(meta),
        }
      }
    }
  }, [flatHabits, flatPlans])

  const execute = useCallback(async (action: ActionItem) => {
    switch (action.actionType) {
      case "create_habit_log":
        await postHabitLog({
          habitId: action.data.habitId,
          body: {
            completedAt: new Date().toISOString(),
            notes: action.data.notes,
          },
        }).unwrap()
        break

      case "create_task_log":
        await postTaskLog({
          projectId: "projectId",
          phaseId: "phaseId",
          taskId: action.data.taskId,
          body: { text: action.data.text },
        }).unwrap()
        break

      case "patch_task": {
        const { projectId, phaseId, taskId, ...body } = action.data
        await patchTask({
          projectId,
          phaseId,
          taskId,
          body, // UpdateTaskInput fields only
        }).unwrap()
        break
      }
    }
  }, [postHabitLog, postTaskLog, patchTask])

  const suggest = useCallback(() => {
    const habitTitles = flatHabits.map((h) => h.habitTitle).filter(Boolean)
    const taskTitles = flatPlans.flatMap((p) =>
      p.phases.flatMap((ph) => ph.tasks.map((t) => t.title).filter(Boolean))
    )
    return [...habitTitles, ...taskTitles].slice(0, 6) as string[]
  }, [flatHabits, flatPlans])

  const { run, submit, undo, dismiss } = useAgentRun({
    plan,
    describe,
    execute,
    suggest,
  })

  if(loadingHabitsData || loadingPlansData){
     return <></>
  }

return (
    <div className="mt-4">
      <AgentInput run={run} onSubmit={submit} />
      <AgentRunModal
        run={run}
        onUndo={undo}
        onDismiss={dismiss}
        onPick={(name) => submit(name)}
      />
    </div>
  )
}




export default AgentContainer
