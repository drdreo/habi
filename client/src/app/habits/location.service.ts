import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class LocationService {
    private habitIdToWatchId = new Map();
    private options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
    };

    startLocationTracking(habitId: string) {
        const watchId = navigator.geolocation.watchPosition(
            (resp) => this.handlePositionUpdate(resp),
            (err) => this.handleError(err),
            this.options
        );
        this.habitIdToWatchId.set(habitId, watchId);
    }

    stopLocationTracking(habitId: string) {
        const watchId = this.habitIdToWatchId.get(habitId);
        navigator.geolocation.clearWatch(watchId);
        this.habitIdToWatchId.delete(watchId);
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (resp) => {
                    this.handlePositionUpdate(resp);
                    resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    private handlePositionUpdate(resp: GeolocationPosition) {
        console.log(resp);
        const { longitude, latitude } = resp.coords;
        console.log("Position updated: ", longitude, latitude);
    }

    private handleError(error: any) {
        console.error("Error: ", error);
    }
}
