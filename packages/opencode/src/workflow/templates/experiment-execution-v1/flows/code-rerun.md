# Code Rerun Flow

This flow is for the common case where code must change and the experiment should then be redeployed and run again.

Execution outline:

- Re-read experiment context and configuration.
- Update code under `code_path`.
- Wait for user approval before remote execution.
- Deploy the updated code and launch the run.
- Register W&B monitoring and record successful runtime setup if launch succeeds.
- Commit code changes at the end when appropriate.
