# Run Only Flow

This flow is for the case where code, environment, and resources are already considered ready and only the launch plus monitoring steps are needed.

Execution outline:

- Re-read experiment context and configuration.
- Verify the final run command and launch the experiment.
- Register W&B monitoring immediately after startup.
