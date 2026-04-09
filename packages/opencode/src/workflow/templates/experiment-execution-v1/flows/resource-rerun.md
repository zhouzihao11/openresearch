# Resource Rerun Flow

This flow is for rerunning after a dataset, model, checkpoint, or other runtime resource issue.

Execution outline:

- Re-read experiment context and configuration.
- Resolve local, synced, or remote-downloaded resources.
- Launch the experiment again with the verified remote paths.
- Register W&B monitoring if startup succeeds.
