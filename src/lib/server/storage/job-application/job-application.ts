/**
 * Candidate application tied to a {@link Job}.
 */
export interface JobApplication {
	id: string;
	jobId: string;
	candidateName: string;
	candidateEmail: string;
	createdAt: Date;
	presentedEvidence: Evidence[];
}

/**
 * SkillVerification represents a verification of a skill for a {@link JobApplication}.
 */
export interface EvidenceItem {
	skillId: string;
	narrative: string;
	evidenceType: EvidenceType;
	verifiableCredential?: VerifiableCredential;
	evidenceUrl?: string;
}
