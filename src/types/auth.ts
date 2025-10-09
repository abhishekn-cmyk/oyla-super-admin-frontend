// types/superadmin.ts
export interface ISuperAdmin {
  _id:string;
  email: string;
  role: string;
}
export interface ISuperAdminPolicies {
  terms?: string;
  privacyPolicy?: string;
  renewalRules?: string;
}
