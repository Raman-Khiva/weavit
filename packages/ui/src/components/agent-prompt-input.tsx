"use client"

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@workspace/ui/components/ai-elements/attachments"
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@workspace/ui/components/ai-elements/model-selector"
import type { PromptInputMessage } from "@workspace/ui/components/ai-elements/prompt-input"
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@workspace/ui/components/ai-elements/prompt-input"
import { cn } from "@workspace/ui/lib/utils"
import type { ChatStatus } from "ai"
import { CheckIcon, GlobeIcon } from "lucide-react"
import { memo, useCallback } from "react"

export type AgentPromptModel = {
  chef: string
  chefSlug: string
  id: string
  name: string
  providers: string[]
}

export type AgentPromptInputProps = {
  models: AgentPromptModel[]
  selectedModelId: string
  modelSelectorOpen: boolean
  onModelSelectorOpenChange: (open: boolean) => void
  onModelSelect: (id: string) => void
  status: ChatStatus
  onSubmit: (message: PromptInputMessage) => void
  className?: string
  showSearch?: boolean
}

type AttachmentItemProps = {
  attachment: {
    id: string
    type: "file"
    filename?: string
    mediaType?: string
    url: string
  }
  onRemove: (id: string) => void
}

const AttachmentItem = memo(({ attachment, onRemove }: AttachmentItemProps) => {
  const handleRemove = useCallback(
    () => onRemove(attachment.id),
    [onRemove, attachment.id]
  )
  return (
    <Attachment data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  )
})

AttachmentItem.displayName = "AttachmentItem"

type ModelItemProps = {
  model: AgentPromptModel
  selectedModelId: string
  onSelect: (id: string) => void
}

const ModelItem = memo(({ model, selectedModelId, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(() => onSelect(model.id), [onSelect, model.id])
  return (
    <ModelSelectorItem onSelect={handleSelect} value={model.id}>
      <ModelSelectorLogo provider={model.chefSlug} />
      <ModelSelectorName>{model.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {model.providers.map((provider) => (
          <ModelSelectorLogo key={provider} provider={provider} />
        ))}
      </ModelSelectorLogoGroup>
      {selectedModelId === model.id ? (
        <CheckIcon className="ml-auto size-4" />
      ) : (
        <div className="ml-auto size-4" />
      )}
    </ModelSelectorItem>
  )
})

ModelItem.displayName = "ModelItem"

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments()

  const handleRemove = useCallback(
    (id: string) => attachments.remove(id),
    [attachments]
  )

  if (attachments.files.length === 0) {
    return null
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  )
}

export function AgentPromptInput({
  models,
  selectedModelId,
  modelSelectorOpen,
  onModelSelectorOpenChange,
  onModelSelect,
  status,
  onSubmit,
  className,
  showSearch = true,
}: AgentPromptInputProps) {
  const selectedModel = models.find((model) => model.id === selectedModelId)
  const chefs = [...new Set(models.map((model) => model.chef))]

  return (
    <div className={cn("size-full", className)}>
      <PromptInputProvider>
        <PromptInput
          className="bg-background"
          globalDrop
          multiple
          onSubmit={onSubmit}
        >
          <PromptInputAttachmentsDisplay />
          <PromptInputBody className="bg-background">
            <PromptInputTextarea />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                  <PromptInputActionAddScreenshot />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              {showSearch ? (
                <PromptInputButton>
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
              ) : null}
              <ModelSelector
                onOpenChange={onModelSelectorOpenChange}
                open={modelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModel?.chefSlug ? (
                      <ModelSelectorLogo provider={selectedModel.chefSlug} />
                    ) : null}
                    {selectedModel?.name ? (
                      <ModelSelectorName>{selectedModel.name}</ModelSelectorName>
                    ) : null}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {chefs.map((chef) => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {models
                          .filter((model) => model.chef === chef)
                          .map((model) => (
                            <ModelItem
                              key={model.id}
                              model={model}
                              onSelect={onModelSelect}
                              selectedModelId={selectedModelId}
                            />
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </PromptInputProvider>
    </div>
  )
}
