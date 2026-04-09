# Review Plan With User

Present the plan summary to the user and do not continue until the user confirms or revises it.

Required actions:

1. Summarize the plan clearly, including successful experience reuse assumptions when present.
2. Ask the user whether the plan is approved or what should change.
3. Use `workflow.wait_interaction` to pause for the user's response.
4. When resumed:
   - if the user approves, write `plan_approved: true`
   - if the user requests changes, you MUST update or regenerate the plan by invoking the `experiment_plan` subagent before finishing this step

Context writes required before `workflow.next`:

- `plan_approved`
- `plan_review_notes`

Result object should summarize:

- whether the user approved the plan
- whether revisions were requested

Important rules:

- Do not move to coding before explicit user approval.
- If the user asks for plan changes, handle them inside this step before calling `workflow.next`.
- Do not manually substitute for `experiment_plan` when plan regeneration or structured revision is needed.
