import z from "zod"
import { Tool } from "./tool"
import { ExperimentRemoteTask } from "@/research/experiment-remote-task"
import { forceRefreshRemoteTask } from "@/research/experiment-remote-task-watcher"
import { ExperimentTable, RemoteServerTable } from "@/research/research.sql"
import {
  inspectRemoteTask,
  parseInspectOutput,
  readRemoteTaskLog,
  session,
  startRemoteTask,
} from "@/research/remote-task-runner"
import { normalizeRemoteServerConfig, remoteServerLabel } from "@/research/remote-server"
import { Database, eq } from "@/storage/db"

const kind = z.enum(["resource_download", "experiment_run"])

const blocked = [/\bscreen\s+-d/, /\bnohup\b/, /\bssh(pass)?\b/, /<<['"]?[A-Z_]+['"]?/, /\bbash\s+-s\b/]

export function assertRawRemoteCommand(command: string) {
  const value = command.trim()
  if (!value) throw new Error("command must be a non-empty raw remote command")
  if (!blocked.some((rule) => rule.test(value))) return value
  throw new Error(
    "command must be the raw remote business command only; do not include ssh, sshpass, screen, nohup, heredoc, or other wrapper layers",
  )
}

function server(expId: string) {
  const exp = Database.use((db) => db.select().from(ExperimentTable).where(eq(ExperimentTable.exp_id, expId)).get())
  if (!exp) throw new Error(`experiment not found: ${expId}`)
  if (!exp.remote_server_id) throw new Error(`experiment has no remote server: ${expId}`)
  const row = Database.use((db) =>
    db.select().from(RemoteServerTable).where(eq(RemoteServerTable.id, exp.remote_server_id!)).get(),
  )
  if (!row) throw new Error(`remote server not found: ${exp.remote_server_id}`)
  return normalizeRemoteServerConfig(JSON.parse(row.config))
}

export const ExperimentRemoteTaskStartTool = Tool.define("experiment_remote_task_start", {
  description:
    "Start a remote long-running experiment task. Pass only the raw remote business command; this tool owns the ssh/heredoc/screen wrapper.",
  parameters: z.object({
    expId: z.string().describe("Experiment ID for the task record."),
    kind,
    title: z.string().describe("Short task title shown in watches."),
    remoteRoot: z.string().describe("Remote root used for remote task logs and control directory."),
    command: z
      .string()
      .describe(
        "Raw remote business command only, such as a modelscope download or training command. Do not include ssh, sshpass, screen, nohup, heredoc, or wrapper scripts.",
      ),
    resourceKey: z.string().optional().describe("Stable resource key for resource download deduplication."),
    targetPath: z.string().nullable().optional().describe("Final remote target path produced by the command."),
    sourceSelection: z
      .string()
      .nullable()
      .optional()
      .describe("Chosen source label such as modelscope or huggingface."),
    method: z.string().nullable().optional().describe("Download or run method label for display."),
  }),
  async execute(params) {
    const command = assertRawRemoteCommand(params.command)
    const cfg = server(params.expId)
    const task = ExperimentRemoteTask.create({
      expId: params.expId,
      kind: params.kind,
      resourceKey: params.resourceKey,
      title: params.title,
      server: JSON.stringify(cfg),
      remoteRoot: params.remoteRoot,
      targetPath: params.targetPath ?? null,
      screenName: session(params.resourceKey ? `${params.expId}-${params.resourceKey}` : params.expId),
      command,
      sourceSelection: params.sourceSelection ?? null,
      method: params.method ?? null,
    })
    const result = await startRemoteTask({
      server: cfg,
      taskId: task.task_id,
      remoteRoot: params.remoteRoot,
      screenName: task.screen_name,
      command,
    })
    if (!result.ok) {
      ExperimentRemoteTask.update({ taskId: task.task_id, status: "failed", errorMessage: result.output || "failed" })
      throw new Error(result.output || "failed to start remote task")
    }
    const updated = ExperimentRemoteTask.update({
      taskId: task.task_id,
      status: "running",
      logPath: result.logPath,
      errorMessage: null,
    })
    return {
      title: `Remote task: ${updated?.title ?? task.title}`,
      output: [
        `Task ID: ${task.task_id}`,
        `Server: ${remoteServerLabel(cfg)}`,
        `Screen: ${task.screen_name}`,
        `Log: ${result.logPath}`,
      ].join("\n"),
      metadata: { taskId: task.task_id, screenName: task.screen_name },
    }
  },
})

export const ExperimentRemoteTaskGetTool = Tool.define("experiment_remote_task_get", {
  description:
    "Get the current remote task for an experiment. Returns one active task when present, otherwise the latest task, with current status, error, and the last 20 log lines.",
  parameters: z.object({
    expId: z.string().describe("Experiment ID to inspect."),
  }),
  async execute(params) {
    await forceRefreshRemoteTask(params.expId)
    const task = ExperimentRemoteTask.current(params.expId)
    if (!task) {
      throw new Error(`no remote task found for experiment: ${params.expId}`)
    }
    const server = normalizeRemoteServerConfig(JSON.parse(task.server))
    const live = task.log_path
      ? await inspectRemoteTask({
          server,
          logPath: task.log_path,
          screenName: task.screen_name,
          targetPath: task.target_path,
        })
      : null
    const tail = task.log_path ? await readRemoteTaskLog({ server, logPath: task.log_path, lines: 20 }) : null
    const screen = live
      ? parseInspectOutput(live.output).screen || "unknown"
      : task.status === "running"
        ? "unknown"
        : "stopped"
    const error = task.status === "failed" || task.status === "crashed" ? task.error_message : null

    return {
      title: `Remote task: ${task.title}`,
      output: [
        `Task ID: ${task.task_id}`,
        `Kind: ${task.kind}`,
        `Title: ${task.title}`,
        `Status: ${task.status}`,
        `Screen: ${screen}`,
        `Server: ${remoteServerLabel(server)}`,
        `Log: ${task.log_path ?? "-"}`,
        task.error_message ? `Error: ${task.error_message}` : null,
        "",
        "Last 20 log lines:",
        tail?.output || "(log unavailable)",
      ]
        .filter(Boolean)
        .join("\n"),
      metadata: {
        taskId: task.task_id,
        kind: task.kind,
        title: task.title,
        status: task.status,
        screen,
        logPath: task.log_path,
        errorMessage: error,
        tail: tail?.output || "",
      },
    }
  },
})
