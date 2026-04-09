# Review Or Generate Experiment Plan

Read the current experiment plan, decide whether it is reusable, and generate or update it only when needed.

Required actions:

1. Immediately after entering this step, update the execution watch to:
   - `status: running`
   - `stage: planning`
   - `message: Reviewing or generating the experiment plan`
2. Read the current file at `exp_plan_path` when it exists.
3. Reuse the existing plan only when it is present, non-empty, and still fits the current experiment goal.
4. If the plan is missing, empty, stale, or needs revision, you MUST invoke the `experiment_plan` subagent.
5. If a matching successful experience exists, the plan summary must explicitly mention:
   - that successful experience was found for this `code_path`
   - which server, environment, and key resource paths were recorded
   - that first execution should prefer reuse before rebuilding environment or resources

Context writes required before `workflow.next`:

- `plan_path`
- `plan_exists`
- `plan_source` as `existing` or `generated`
- `plan_summary`
- `plan_requires_user_review`

Result object should summarize:

- whether the plan was reused or regenerated
- what the plan intends to do
- whether successful experience reuse was incorporated

Important rules:

- Generate a new plan only when necessary.
- Do not proceed to coding until the plan summary is ready for user review.
- When a new or revised plan is needed, do not rewrite the plan logic yourself; use the `experiment_plan` subagent.
