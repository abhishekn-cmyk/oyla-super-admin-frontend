// types/user.ts
export interface IUserProfile {
  firstName: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  mobileNumber?: string;
  profileImage?: string;
  selectedPrograms?: string[];
}

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  isVerified?: boolean;
  profile?: IUserProfile;
  createdAt?: string;
  updatedAt?: string;
}
