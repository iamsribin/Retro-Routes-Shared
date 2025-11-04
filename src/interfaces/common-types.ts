export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface LocationCoordinates {
    address:string;
    latitude: number;
    longitude: number;
}

export type IRole = "User"|"Admin"| "Driver"