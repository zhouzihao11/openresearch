# Record Successful Runtime Setup

Persist the actual successful runtime setup so future experiments on the same `code_path` can reuse it.

Required actions:

1. You MUST invoke `experiment_success` after the run has started successfully and W&B monitoring is registered.
2. Record the actual runtime setup used, not just the planned setup.
3. Persist at least:
   - actual server used
   - actual environment name used
   - actual reusable dataset/model/resource paths
4. Make it explicit that future runs on the same `code_path` should try reusing this runtime setup first before rebuilding.

Context writes required before `workflow.next`:

- `successful_runtime_recorded`
- `successful_runtime_summary`

Result object should summarize:

- what runtime setup was recorded
- what should be reusable for future runs

Important rules:

- Record reality, not only the plan.
- Do not write the success note manually when this step runs; use `experiment_success`.
