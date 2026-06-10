import React from "react"
import { OpenaiIcon } from "@workspace/ui/components/icons/simple-icons-openai"
import { ChatgptIcon } from "@workspace/ui/components/icons/chatgpt"

export const WebActivity = () => {
  return (
    <main>
      <div className="WebActivitiesflex gap-2">
        <ChatgptIcon />
      </div>
      <p>24</p>
    </main>
  )
}

const WebActivities = () => {
  return (
    <main>
      <h2> WebActivities</h2>
      <WebActivity />
    </main>
  )
}

export default WebActivities
