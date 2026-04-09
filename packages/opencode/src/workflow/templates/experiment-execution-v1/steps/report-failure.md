# Report Repeated Failure To User

Summarize repeated failures, explain the likely blocker, and ask the user how to proceed.

Required actions:

1. Present the attempt history, latest error summary, and the current best diagnosis.
2. Use `workflow.wait_interaction` to ask the user whether to:
   - retry
   - revise code or plan
   - provide missing configuration
   - stop
3. When resumed, either:
   - insert the required recovery path with `workflow.edit` using the original business step kinds, or
   - fail the workflow if the user wants to stop

Context writes required before `workflow.next`:

- `failure_review_notes`
- `user_failure_decision`

Result object should summarize:

- how many failed attempts occurred
- what the user decided

Important rules:

- Do not continue automatically after repeated failure without user direction.
