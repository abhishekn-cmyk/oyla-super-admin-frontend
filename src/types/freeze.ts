export interface Freeze {
  _id?: string;
  userId: { _id: string; username: string } | string;
  productId: { _id: string; name: string } | string;
  freezeDate: string;
  meals: string[];
  status?: string;
  selectedDate?: string;
}
