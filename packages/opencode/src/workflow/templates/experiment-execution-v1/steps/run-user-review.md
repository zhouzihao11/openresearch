# Ask User Before Remote Execution

Show the user the code changes and execution intent, then wait for approval before any remote deployment or run.

Required actions:

1. Summarize the code changes, expected run path, and any environment or resource work that will follow.
2. Ask the user: `Do you approve running this experiment on the remote server?`
3. Use `workflow.wait_interaction` to pause.
4. When resumed:
   - if approved, write `run_approved: true`
   - if rejected, write the user's feedback and do not continue until the requested changes are handled

Context writes required before `workflow.next`:

- `run_approved`
- `run_review_notes`

Result object should summarize:

- whether the user approved remote execution
- whether further code changes were requested

Important rules:

- Do not deploy code or run anything remotely before explicit user approval.
