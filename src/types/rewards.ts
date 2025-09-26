// types/reward.ts
type RewardType = "fixed" | "percentage" | "points";
export interface IReward {
  _id: string;
  title: string;
  description?: string;
  type: RewardType;
  value: number;
  code?: string;
  expiryDate?: string;
  isActive?: boolean;
  users?: string[];          // assigned users
  redeemedUsers?: string[];  // redeemed users
  createdAt: string;
  updatedAt: string;
}
