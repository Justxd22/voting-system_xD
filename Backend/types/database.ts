import { Timestamp } from 'firebase-admin/firestore';

export interface SessionToken {
  token: string;
  createdAt: Timestamp;  // Changed from Date to Timestamp
  expiresAt: Timestamp;  // Changed from Date to Timestamp
  ipHash: string;  // Hashed IP address for anonymity
}

export interface Vote {
  sessionToken: string;
  option: string;
  votedAt: Timestamp;  // Changed from Date to Timestamp
  ipHash: string;
}

export interface VoteCount {
  option: string;
  count: number;
}

// Helper type for document references
export type WithId<T> = T & { id: string };