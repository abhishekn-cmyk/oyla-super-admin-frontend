export interface IDeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  adminId?: string;
  currentStatus?: "available" | "busy" | "offline";
  location?: { latitude: number; longitude: number; lastUpdated: string };
  totalDeliveries?: number;
  completedDeliveries?: number;
  rating?: number;
  earnings?: number;
  notes:string;
  stats:{
    completed:string;
    pending:string;
    ongoing:string;

  };
}

export interface IDelivery {
  _id: string;
  driverId?: IDeliveryPartner;
  orderId?: any;
  customerId?: string;
  deliveryStatus: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveredProducts?: any[];
}

export interface IStats {
  totalDrivers: number;
  activeDrivers: number;
  totalDeliveries: number;
  completedDeliveries: number;
  data: {
    drivers: {
      total: number;
      active: number;
      busy: number;
    };
    deliveries: {
      total: number;
      completed: number;
      assigned: number;
      cancelled: number;
      pending: number;
      dispatched: number;
      failed: number;
      pickedUp: number;
      avgDeliveryTimeMinutes: number;
    };
  };
}
