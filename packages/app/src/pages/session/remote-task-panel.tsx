import { createSignal, Show } from "solid-js"

import type { WatchRow } from "@/pages/session/watches-tab"

function statusColor(status: WatchRow["remote_task_status"]) {
  if (status === "failed") return "text-icon-critical-base"
  if (status === "finished") return "text-icon-success-base"
  if (status === "pending" || status === "running") return "text-icon-warning-base"
  return "text-text-weak"
}

function notice(watch: WatchRow) {
  if (!watch.remote_task_kind || !watch.remote_task_status) return
  const name = watch.remote_task_kind === "experiment_run" ? "Experiment task" : "Remote task"
  if (watch.remote_task_status === "failed") return `${name} failed`
  if (watch.remote_task_status === "finished") {
    if (watch.remote_task_kind === "resource_download") return "Remote downloads finished"
    return "Experiment task finished"
  }
  if (watch.remote_task_status === "pending") return `${name} pending`
  if (watch.remote_task_status === "running") return `${name} running`
}

function showTarget(watch: WatchRow) {
  return watch.remote_task_kind !== "experiment_run"
}

export function RemoteTaskPanel(props: {
  watch: WatchRow
  syncing: boolean
  onRefresh: () => void
  onOpenLog: () => void
}) {
  const [open, setOpen] = createSignal(false)

  return (
    <div class="mt-2 rounded-md border border-border-weak-base bg-background-stronger px-2.5 py-2">
      <button
        class="flex w-full items-center justify-between gap-3 text-left"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open())
        }}
      >
        <div class="flex min-w-0 items-center gap-2">
          <span class="text-11-regular font-medium text-text-base">Remote Task</span>
          <Show when={props.watch.remote_task_status}>
            {(status) => <span class={`text-11-regular ${statusColor(status())}`}>{status()}</span>}
          </Show>
        </div>
        <span class="text-11-regular text-text-weak">{open() ? "Hide" : "Show"}</span>
      </button>
      <Show when={notice(props.watch)}>
        {(text) => <div class={`mt-1 text-11-regular ${statusColor(props.watch.remote_task_status)}`}>{text()}</div>}
      </Show>
      <Show when={open()}>
        <div class="mt-2 flex flex-col gap-1 text-11-regular text-text-weak">
          <Show when={props.watch.remote_task_title}>
            <span>Task: {props.watch.remote_task_title}</span>
          </Show>
          <Show when={props.watch.remote_task_kind}>
            <span>Kind: {props.watch.remote_task_kind}</span>
          </Show>
          <Show when={props.watch.remote_task_status}>
            <span class={statusColor(props.watch.remote_task_status)}>Status: {props.watch.remote_task_status}</span>
          </Show>
          <Show when={showTarget(props.watch) && props.watch.remote_task_target_path}>
            <span class="font-mono break-all">Target: {props.watch.remote_task_target_path}</span>
          </Show>
          <Show when={props.watch.remote_task_screen_name}>
            <span class="font-mono break-all">Screen: {props.watch.remote_task_screen_name}</span>
          </Show>
          <Show when={props.watch.remote_task_log_path}>
            <span class="font-mono break-all">Log: {props.watch.remote_task_log_path}</span>
          </Show>
          <Show
            when={
              props.watch.remote_task_error_message &&
              props.watch.remote_task_error_message !== props.watch.error_message
            }
          >
            <div class="text-icon-critical-base">{props.watch.remote_task_error_message}</div>
          </Show>
          <div class="mt-1 flex gap-2">
            <button
              class="px-2 py-0.5 rounded text-11-regular bg-background-base text-text-base hover:text-text-strong transition-colors disabled:opacity-50"
              disabled={props.syncing}
              onClick={(e) => {
                e.stopPropagation()
                props.onRefresh()
              }}
            >
              {props.syncing ? "Refreshing..." : "Refresh Task"}
            </button>
            <Show when={props.watch.remote_task_log_path}>
              <button
                class="px-2 py-0.5 rounded text-11-regular bg-background-base text-text-base hover:text-text-strong transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  props.onOpenLog()
                }}
              >
                Log
              </button>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
