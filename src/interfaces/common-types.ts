export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface LocationCoordinates {
    address:string;
    latitude: number;
    longitude: number;
}

export interface OnlineDriverDetails {
  driverId: string;
  driverNumber: string;
  name: string;
  cancelledRides: number;
  rating: number;
  vehicleModel?: string;
  driverPhoto?: string;
  vehicleNumber?: string;
}


export type IRole = "User"|"Admin"| "Driver"