export interface PrivacyPolicy {
  _id?: string;          // optional, present in DB
  title: string;         // e.g., "Privacy Policy"
  content: string;       // full HTML/text content
  version?: string;      // optional version number, e.g., "1.0"
  effectiveDate?: string | Date; // can be Date object or ISO string
  isActive?: boolean;    // mark the current active policy
  createdAt?: string;    // optional timestamps
  updatedAt?: string;
}

