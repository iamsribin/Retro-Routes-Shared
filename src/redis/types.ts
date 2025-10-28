// shared/src/redis/types.ts
export interface DriverDetails {
  driverId: string;
  driverNumber: string;
  name: string;
  cancelledRides: number;
  rating: number;
  vehicleModel?: string;
  driverPhoto?: string;
  vehicleNumber?: string;
}
