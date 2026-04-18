# Prepare Remote Resources

Resolve datasets, models, checkpoints, and any other runtime resources needed by the experiment.

Required actions:

1. Determine which resources are required by the current plan and code.
2. If a matching successful experience already records reusable resource paths for this `code_path`, prefer reusing them on the first attempt.
3. All resources must resolve to remote absolute paths under `resource_root` unless the plan explicitly states otherwise.
4. First check whether each resource is already valid remotely.
5. You MUST invoke `experiment_remote_download` only for the resources still missing remotely.
6. Treat `running` from `experiment_remote_download` as not ready; it must never be treated as success.
7. If resource preparation returns `running`, call `workflow.wait_interaction` with a clear message telling the user the remote download is running in the background and they should reply after it finishes.
8. Collect the final remote absolute paths and map them to the runtime CLI arguments expected by the code.
9. Use `todowrite` to track resource preparation work one resource at a time when more than one resource still needs action.
10. Update the execution watch before each concrete resource stage using the appropriate stage:

- `remote_downloading`
- `verifying_resources`

11. When this same step is reached again after a failed run, treat it as another pass of resource preparation:

- reuse prior `resolved_resources` and retry state from context
- only redo the resource work affected by the last failure
- avoid discarding already verified resource paths

Context writes required before `workflow.next`:

- `resources_required`
- `resolved_resources`
- `resource_ready`
- `resource_summary`
- `resource_retry_state`

Result object should summarize:

- which resources were reused
- which were downloaded locally
- which were downloaded remotely
- which were synced and verified remotely

Failure handling:

- If a resource step fails, update the execution watch to `status: failed` for the failing stage before asking the user, retrying, or editing the workflow.
- If runtime findings require remediation before the run can continue, use `workflow.edit` to insert `prepare_resources` and `run_experiment` as needed.

Important rules:

- `running` from `experiment_remote_download` is not success.
- Final readiness means usable remote absolute paths are resolved.
- Do not let this step silently continue without verified resource paths when the run depends on them.
- Do not introduce separate retry step kinds for resource preparation; repeat `prepare_resources` when recovery requires it.
- Do not perform remote download work yourself when the corresponding subagent is required; invoke `experiment_remote_download`.
