import { and, Database, eq } from "../storage/db"
import { ExperimentExecutionWatchTable, ExperimentTable, ExperimentWatchTable } from "./research.sql"

type ExecutionStatus = typeof ExperimentExecutionWatchTable.$inferSelect.status
type ExecutionStage = typeof ExperimentExecutionWatchTable.$inferSelect.stage

interface UpdateInput {
  expId?: string
  watchId?: string
  status?: ExecutionStatus
  stage?: ExecutionStage
  title?: string
  message?: string | null
  wandbEntity?: string | null
  wandbProject?: string | null
  wandbRunId?: string | null
  errorMessage?: string | null
  startedAt?: number | null
  finishedAt?: number | null
}

interface SyncOptions {
  preserveStage?: boolean
}

function row(input: { expId?: string; watchId?: string }) {
  if (input.watchId) {
    return Database.use((db) =>
      db
        .select()
        .from(ExperimentExecutionWatchTable)
        .where(eq(ExperimentExecutionWatchTable.watch_id, input.watchId!))
        .get(),
    )
  }
  if (!input.expId) return
  return Database.use((db) =>
    db.select().from(ExperimentExecutionWatchTable).where(eq(ExperimentExecutionWatchTable.exp_id, input.expId!)).get(),
  )
}

export namespace ExperimentExecutionWatch {
  export function createOrGet(expId: string, title: string, stage: ExecutionStage = "planning") {
    const existing = row({ expId })
    if (existing) return existing
    const now = Date.now()
    const watchId = crypto.randomUUID()
    Database.use((db) =>
      db
        .insert(ExperimentExecutionWatchTable)
        .values({
          watch_id: watchId,
          exp_id: expId,
          status: "pending",
          stage,
          title,
          started_at: now,
          time_created: now,
          time_updated: now,
        })
        .run(),
    )
    return row({ watchId })!
  }

  export function update(input: UpdateInput) {
    const existing = row(input)
    if (!existing) return
    const now = Date.now()
    Database.use((db) =>
      db
        .update(ExperimentExecutionWatchTable)
        .set({
          status: input.status ?? existing.status,
          stage: input.stage ?? existing.stage,
          title: input.title ?? existing.title,
          message: input.message === undefined ? existing.message : input.message,
          wandb_entity: input.wandbEntity === undefined ? existing.wandb_entity : input.wandbEntity,
          wandb_project: input.wandbProject === undefined ? existing.wandb_project : input.wandbProject,
          wandb_run_id: input.wandbRunId === undefined ? existing.wandb_run_id : input.wandbRunId,
          error_message: input.errorMessage === undefined ? existing.error_message : input.errorMessage,
          started_at: input.startedAt === undefined ? existing.started_at : input.startedAt,
          finished_at: input.finishedAt === undefined ? existing.finished_at : input.finishedAt,
          time_updated: now,
        })
        .where(eq(ExperimentExecutionWatchTable.watch_id, existing.watch_id))
        .run(),
    )
  }

  export function deleteByExp(expId: string) {
    Database.use((db) =>
      db.delete(ExperimentExecutionWatchTable).where(eq(ExperimentExecutionWatchTable.exp_id, expId)).run(),
    )
  }

  export function findInternal(expId: string, runId: string) {
    return Database.use((db) =>
      db
        .select()
        .from(ExperimentWatchTable)
        .where(and(eq(ExperimentWatchTable.exp_id, expId), eq(ExperimentWatchTable.wandb_run_id, runId)))
        .get(),
    )
  }

  export function syncWatch(expId: string, watch: typeof ExperimentWatchTable.$inferSelect, _opts?: SyncOptions) {
    createOrGet(expId, title(expId))
    update({
      expId,
      status: watch.status === "finished" ? "finished" : watch.status === "running" ? "running" : "failed",
      stage: undefined,
      wandbEntity: watch.wandb_entity,
      wandbProject: watch.wandb_project,
      wandbRunId: watch.wandb_run_id,
      message: undefined,
      errorMessage: watch.status === "finished" ? null : watch.error_message,
      finishedAt:
        watch.status === "finished" || watch.status === "failed" || watch.status === "crashed" ? Date.now() : null,
    })
  }

  export function syncRemoteTask(expId: string, _opts?: SyncOptions) {
    createOrGet(expId, title(expId))
  }

  export function title(expId: string) {
    const exp = Database.use((db) => db.select().from(ExperimentTable).where(eq(ExperimentTable.exp_id, expId)).get())
    return exp?.atom_id ? `${exp.exp_id} (${exp.atom_id})` : expId
  }
}
