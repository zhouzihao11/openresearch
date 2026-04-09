# Implement Experiment Code

Apply the approved experiment plan to the codebase under the experiment `code_path` only.

Required actions:

1. Immediately after entering this step, update the execution watch to:
   - `status: running`
   - `stage: coding`
   - `message: Implementing experiment code changes`
2. You may read files outside `code_path` when needed to understand surrounding project conventions, shared utilities, interfaces, configs, or related experiment context.
3. Modify files only inside `code_path`.
4. Implement exactly what the plan requires. Do not refactor unrelated code or add extra features.
5. Ensure W&B integration is present when the experiment code needs it:
   - accept W&B configuration by CLI arguments
   - do not hardcode the API key
   - expect `WANDB_API_KEY` from the runtime environment
   - use `<exp_id>_<timestamp>` as both run name and run id
   - initialize W&B with explicit `project`, `id`, and `name`
   - log important metrics while preserving normal stdout/stderr output
   - call `wandb.finish()` at the end
6. Ensure planned remote resources are passed through explicit CLI arguments such as `--model-path` or `--dataset-path`.
7. Fail fast with a clear error message when required resource arguments are missing.
8. Prepare a concise change summary for user review.

Context writes required before `workflow.next`:

- `code_changed`
- `code_summary`
- `resource_args_required`
- `env_changes_required`

Result object should summarize:

- which files changed
- whether W&B integration was added or updated
- whether runtime resource arguments were added or updated

Important rules:

- You may inspect files outside `code_path`, but all code writes must stay strictly inside `code_path`.
- Do not continue straight to deployment without the user review step.
- If coding cannot be completed because the plan is inadequate, use `workflow.fail` with a concrete reason.
