# Commit Code Changes

Commit experiment code changes at the end of the workflow when code was modified and a commit is intended for this experiment flow.

Required actions:

1. Check whether code actually changed during the workflow.
2. If no relevant code changed, record that no commit was needed and finish.
3. If a commit is expected for this experiment flow, you MUST invoke `experiment_commit`.
4. Persist whether a commit was created.

Context writes required before `workflow.next`:

- `commit_needed`
- `commit_done`
- `commit_summary`

Result object should summarize:

- whether a commit was created
- why it was created or skipped

Important rules:

- Do not invent a commit when there are no relevant changes.
- Respect the workflow's expectation for whether this flow should archive the changes.
- Do not perform the commit logic yourself when this step requires a commit; use `experiment_commit`.
