export interface ISubscription {
  _id: string;
  userId: string;
  planType: "basic" | "premium" | "pro";
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "yearly";
  mealsPerDay: number;
  totalMeals: number;
  remainingMeals: number;
  deliveryAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
  };
}
