/** Metadata for a source reference; no atlas pages or construction rules live here. */
export const EVIDENCE_STATUSES = [
  'UNVERIFIED',
  'REVIEW_REQUIRED',
  'VERIFIED',
] as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

/** Distinguishes an atlas consulted directly from ancillary source material. */
export const EVIDENCE_SOURCE_TYPES = [
  'ATLAS',
  'OFFICIAL_METADATA',
  'OTHER',
] as const;

export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export interface EvidenceReference {
  /** Stable opaque key used by a rule's evidenceIds; never use a page number as an ID. */
  id: string;
  atlas: string;
  edition: string;
  /** Printed page identifier, which may include a prefix or suffix. */
  page?: string;
  node?: string;
  section?: string;
  /** Short original summary; do not paste protected atlas passages here. */
  description: string;
  sourceType: EvidenceSourceType;
}

export type Evidence = EvidenceReference & (
  | {
      status: 'UNVERIFIED' | 'REVIEW_REQUIRED';
      reviewedBy?: never;
      reviewedAt?: never;
    }
  | {
      status: 'VERIFIED';
      reviewedBy: string;
      reviewedAt: string;
    }
);

export type EvidenceDraft = EvidenceReference;

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must be a nonempty string`);
  }
  return value.trim();
}

function optional(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : required(value, field);
}

/** Whitelist draft fields to ensure callers cannot smuggle in VERIFIED via a JS object. */
export function createEvidence(draft: EvidenceDraft): Evidence {
  if (!EVIDENCE_SOURCE_TYPES.includes(draft.sourceType)) {
    throw new Error('sourceType is invalid');
  }
  return {
    id: required(draft.id, 'id'),
    atlas: required(draft.atlas, 'atlas'),
    edition: required(draft.edition, 'edition'),
    page: optional(draft.page, 'page'),
    node: optional(draft.node, 'node'),
    section: optional(draft.section, 'section'),
    description: required(draft.description, 'description'),
    sourceType: draft.sourceType,
    status: 'UNVERIFIED',
  };
}

/** Route a source through manual review; this action does not verify it. */
export function requestEvidenceReview(evidence: Evidence): Evidence {
  if (evidence.status === 'VERIFIED') {
    throw new Error('A VERIFIED evidence record cannot be reset implicitly');
  }
  return { ...evidence, status: 'REVIEW_REQUIRED' };
}

export interface EvidenceReviewApproval {
  /** Identifier of the person who checked the primary source. */
  reviewedBy: string;
  /** Timestamp recorded by the trusted review workflow, in ISO 8601 format. */
  reviewedAt: string;
}

/**
 * Explicit manual-approval transition. The caller must authenticate the reviewer,
 * check the source and persist an audit trail; this pure function cannot do that.
 */
export function approveEvidence(
  evidence: Evidence,
  approval: EvidenceReviewApproval,
): Evidence {
  if (evidence.status !== 'REVIEW_REQUIRED') {
    throw new Error('Evidence must be REVIEW_REQUIRED before approval');
  }
  if (evidence.sourceType !== 'ATLAS' || !evidence.page) {
    throw new Error('Verification requires a direct atlas source and printed page');
  }
  const reviewedBy = required(approval.reviewedBy, 'reviewedBy');
  const reviewedAt = required(approval.reviewedAt, 'reviewedAt');
  if (Number.isNaN(Date.parse(reviewedAt)) || !/^\d{4}-\d{2}-\d{2}T/.test(reviewedAt)) {
    throw new Error('reviewedAt must be an ISO 8601 timestamp');
  }
  return { ...evidence, status: 'VERIFIED', reviewedBy, reviewedAt };
}
