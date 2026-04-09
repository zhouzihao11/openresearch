# Register W&B Watch

Register W&B monitoring immediately after the run starts successfully.

Required actions:

1. Invoke `experiment_watch` with:
   - `exp_id`
   - `wandb_project`
   - `wandb_api_key`
   - `wandb_run_id`
2. After registration succeeds, update the execution watch to:
   - `status: running`
   - `stage: watching_wandb`
   - `message: Monitoring the W&B run`
3. Persist the resolved W&B entity and monitoring state in workflow context.

Context writes required before `workflow.next`:

- `wandb_entity`
- `wandb_watch_registered`
- `watch_stage`

Result object should summarize:

- whether W&B monitoring was registered
- which entity/project/run will be watched

Important rules:

- Do not delay watch registration after a successful launch.
