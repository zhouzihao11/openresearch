# Prepare Remote Environment

Prepare or reuse the remote execution environment before the experiment run.

Required actions:

1. Decide whether the environment can be reused safely.
2. If a matching successful experience exists for the same `code_path`, prefer reusing that environment on the first attempt instead of rebuilding conservatively.
3. Only invoke `experiment_setup_env` when:
   - the environment is missing
   - the plan requires packages not present remotely
   - code changes altered dependencies
   - a prior run failure indicates an environment issue
4. Before environment setup, update the execution watch to:
   - `status: running`
   - `stage: setting_up_env`
   - `message: Preparing the remote execution environment`
5. Pass `remote_code_path` when setup depends on files such as `requirements.txt`.
6. When this same step is reached again after a failed run, treat it as a recovery pass of the same business action:
   - read `last_error_kind`, `last_error_summary`, and prior environment context
   - repair only the specific blocking issue when possible
   - avoid redoing unrelated setup work

Context writes required before `workflow.next`:

- `env_ready`
- `env_name`
- `env_reused`
- `env_summary`

Result object should summarize:

- whether the environment was reused or configured
- which environment name will be used for the run

Failure handling:

- If setup fails and the issue appears recoverable, use `workflow.edit` to insert `setup_env` and `run_experiment` as future steps when another environment repair attempt should happen later.
- If setup cannot continue because required configuration is missing, use `workflow.wait_interaction`.

Important rules:

- Do not force a rebuild first when trusted successful experience indicates the environment is reusable.
- Do not introduce a separate retry step kind; repeated environment repair should reuse `setup_env` itself.
- When environment setup is needed, you MUST invoke the `experiment_setup_env` subagent instead of configuring the environment yourself.
