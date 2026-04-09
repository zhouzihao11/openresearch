# Prepare Remote Resources

Resolve datasets, models, checkpoints, and any other runtime resources needed by the experiment.

Required actions:

1. Determine which resources are required by the current plan and code.
2. If a matching successful experience already records reusable resource paths for this `code_path`, prefer reusing them on the first attempt.
3. For resources with `local_prepare_upload` strategy:
   - you MUST invoke `experiment_local_download` only for resources without a valid local copy
   - treat `reused` and `success` as acceptable local preparation outcomes
   - treat `running` as not ready; it must never be treated as success
   - when re-invoking after `running` or `failed`, include the latest known local path, selected source, and prior status details
   - you MUST invoke `experiment_sync_resource` only for resources that still need to be copied to the remote server
4. For resources with `remote_download` strategy:
   - first check whether the resource is already valid remotely
   - you MUST invoke `experiment_remote_download` only for the resources still missing remotely
5. `experiment_sync_resource` owns post-upload extraction, remote directory organization, and final remote verification.
6. Collect the final remote absolute paths and map them to the runtime CLI arguments expected by the code.
7. Use `todowrite` to track resource preparation work one resource at a time when more than one resource still needs action.
8. Update the execution watch before each concrete resource stage using the appropriate stage:
   - `local_downloading`
   - `syncing_resources`
   - `remote_downloading`
   - `verifying_resources`
9. When this same step is reached again after a failed run, treat it as another pass of resource preparation:

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

- `running` from `experiment_local_download` is not success.
- Final readiness means usable remote absolute paths are resolved.
- Do not let this step silently continue without verified resource paths when the run depends on them.
- Do not introduce separate retry step kinds for resource preparation; repeat `prepare_resources` when recovery requires it.
- Do not perform local download, remote download, or sync work yourself when the corresponding subagent is required; invoke the matching resource subagent.
