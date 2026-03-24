import { Show, createMemo, createEffect, onCleanup } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { useFile } from "@/context/file"
import { useSDK } from "@/context/sdk"
import { base64Encode } from "@opencode-ai/util/encode"
import { Markdown } from "@opencode-ai/ui/markdown"
import type { ResearchSessionAtomGetResponse } from "@opencode-ai/sdk/v2"

type Atom = NonNullable<ResearchSessionAtomGetResponse["atom"]>

export function AtomSessionTab(props: { atom: Atom; activeTab: "content" | "proof" | "plan" }) {
  const file = useFile()
  const navigate = useNavigate()
  const params = useParams()
  const sdk = useSDK()

  const returnSessionId = createMemo(() => {
    return sessionStorage.getItem(`atom-session-return-${params.id}`)
  })

  const handleReturn = () => {
    const sessionId = returnSessionId()
    if (sessionId) {
      navigate(`/${base64Encode(sdk.directory)}/session/${sessionId}`)
    }
  }

  const filePath = createMemo(() => {
    switch (props.activeTab) {
      case "content":
        return props.atom.atom_content_path
      case "proof":
        return props.atom.atom_evidence_result_path
      case "plan":
        return props.atom.atom_evidence_plan_path
      default:
        return null
    }
  })

  // Load file when path changes
  createEffect(() => {
    const path = filePath()
    if (!path) return

    let isMounted = true

    // Only load if mounted
    if (isMounted) {
      file.load(path).catch(console.error)
    }

    onCleanup(() => {
      isMounted = false
    })
  })

  // Listen for file changes and reload content
  createEffect(() => {
    const currentFilePath = filePath()
    if (!currentFilePath) return

    let isMounted = true

    const unsub = sdk.event.on("file.watcher.updated" as any, (event: { file: string; event: string }) => {
      // Check if component is still mounted
      if (!isMounted) return

      // Check if the event file matches our current file path
      // The event.file might be absolute while currentFilePath might be relative, or vice versa
      // So we check if one ends with the other
      if (
        (event.file === currentFilePath ||
          event.file.endsWith(currentFilePath) ||
          currentFilePath.endsWith(event.file)) &&
        (event.event === "change" || event.event === "add")
      ) {
        console.log("[atom-session-tab] File changed, reloading:", currentFilePath)
        file.load(currentFilePath, { force: true }).catch(console.error)
      }
    })

    onCleanup(() => {
      isMounted = false
      unsub()
    })
  })

  // Get reactive file state directly from context
  const fileState = createMemo(() => {
    const path = filePath()
    if (!path) return null
    return file.get(path)
  })

  const fileContent = createMemo(() => {
    return fileState()?.content?.content ?? null
  })

  const isLoading = createMemo(() => {
    return fileState()?.loading ?? false
  })

  const hasError = createMemo(() => {
    return !!fileState()?.error
  })

  const tabTitle = () => {
    switch (props.activeTab) {
      case "content":
        return "Content"
      case "proof":
        return "Proof"
      case "plan":
        return "Experiment Plan"
      default:
        return ""
    }
  }

  return (
    <div class="relative flex-1 min-h-0 overflow-hidden h-full flex flex-col">
      <div class="px-3 pt-3 pb-1">
        <div class="flex items-center justify-between">
          <div class="text-12-semibold text-text-weak uppercase tracking-wider">
            {props.atom.atom_name}
            <span class="ml-1.5 text-11-regular normal-case tracking-normal text-text-weak">
              ({props.atom.atom_type})
            </span>
          </div>
          <Show when={returnSessionId()}>
            <button
              onClick={handleReturn}
              class="text-11-regular text-text-weak hover:text-text-base transition-colors"
            >
              ← Return
            </button>
          </Show>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-auto px-3 py-2">
        <Show when={isLoading()}>
          <div class="rounded-md border border-border-weak-base bg-background-base p-3">
            <div class="text-12-semibold text-text-strong mb-2">{tabTitle()}</div>
            <div class="text-12-regular text-text-weak">Loading...</div>
          </div>
        </Show>

        <Show when={hasError()}>
          <div class="rounded-md border border-border-weak-base bg-background-base p-3">
            <div class="text-12-semibold text-text-strong mb-2">{tabTitle()}</div>
            <div class="text-12-regular text-text-weak">Failed to load file content.</div>
          </div>
        </Show>

        <Show when={!isLoading() && !hasError()}>
          <div class="rounded-md border border-border-weak-base bg-background-base p-3">
            <div class="text-12-semibold text-text-strong mb-2">{tabTitle()}</div>
            <Show when={fileContent()?.trim() ? fileContent() : null} keyed>
              {(content) => <Markdown text={content} class="text-12-regular" />}
            </Show>
            <Show when={!fileContent() || fileContent()!.trim().length === 0}>
              <div class="text-12-regular text-text-weak">
                This atom does not have {tabTitle().toLowerCase()} content yet.
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}
