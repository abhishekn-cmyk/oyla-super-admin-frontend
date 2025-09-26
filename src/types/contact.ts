export interface IContact {
  _id: string;
  name: string;
  email: string;
  phoneNumbers?: string[];
  address: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  isRead:false;
}
