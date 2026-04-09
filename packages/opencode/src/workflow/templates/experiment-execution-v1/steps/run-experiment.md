# Launch Experiment

Start the experiment using the resolved environment, resources, and runtime configuration.

Required actions:

1. Immediately after entering this step, update the execution watch to:
   - `status: running`
   - `stage: running_experiment`
   - `message: Launching the experiment process`
2. Before invoking `experiment_run`, verify the final run command includes:
   - `WANDB_API_KEY=<wandb_api_key>`
   - `--wandb-project <wandb_project>`
   - `--wandb-run-id <exp_id>_<timestamp>`
3. When remote resources are required, verify the run command also includes the planned CLI arguments with final remote absolute paths.
4. You MUST invoke `experiment_run` and capture the startup result.
5. Record the final `wandb_run_id`, effective command, and startup summary.
6. When this step is reached again later in the workflow, treat it as another attempt of the same run action and use the saved context to decide what changed since the previous failure.

Context writes required before `workflow.next`:

- `run_attempt_count`
- `run_started`
- `run_command`
- `wandb_run_id`
- `last_error_kind`
- `last_error_summary`

Result object should summarize:

- whether the process started successfully
- which environment and command were used
- the returned W&B run id

Failure handling:

1. Diagnose whether the failure is primarily a:
   - `code_issue`
   - `env_issue`
   - `resource_issue`
   - `unknown_issue`
2. If it is a code issue, use `workflow.edit` to insert recovery steps such as:
   - `coding`
   - `run_user_review`
   - `deploy_code`
   - optional `setup_env` when dependencies changed
   - `run_experiment`
3. If it is an environment issue, use `workflow.edit` to insert:
   - `setup_env`
   - `run_experiment`
4. If it is a resource issue, use `workflow.edit` to insert:
   - `prepare_resources`
   - `run_experiment`
5. If repeated failures continue or recovery is unclear, insert `report_failure`.

Important rules:

- Do not launch the run with incomplete W&B arguments.
- Do not treat partial startup as success unless the run has clearly started.
- Use predefined step kinds only when editing the workflow.
- Do not introduce a separate retry step kind; another attempt should be another `run_experiment` step instance.
- Do not launch the remote experiment process yourself when a run attempt is needed; use `experiment_run`.
