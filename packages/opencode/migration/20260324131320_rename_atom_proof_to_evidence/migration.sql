ALTER TABLE `atom` RENAME COLUMN `atom_proof_type` TO `atom_evidence_type`;
--> statement-breakpoint
ALTER TABLE `atom` RENAME COLUMN `atom_proof_plan_path` TO `atom_evidence_plan_path`;
--> statement-breakpoint
ALTER TABLE `atom` RENAME COLUMN `atom_proof_status` TO `atom_evidence_status`;
--> statement-breakpoint
ALTER TABLE `atom` RENAME COLUMN `atom_proof_result_path` TO `atom_evidence_result_path`;
