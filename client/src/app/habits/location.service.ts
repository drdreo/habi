import { inject, Injectable } from "@angular/core";
import { HabitDataService } from "./habit.data.service";

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

    private habitDataService = inject(HabitDataService);

    startLocationTracking(habitId: string) {
        const watchId = navigator.geolocation.watchPosition(
            (resp) => this.handlePositionUpdate(habitId, resp),
            (err) => this.handleError(err),
            this.options
        );
        this.habitIdToWatchId.set(habitId, watchId);

        return this.habitDataService.createTrackingSession(habitId);
    }

    stopLocationTracking(habitId: string) {
        const watchId = this.habitIdToWatchId.get(habitId);
        navigator.geolocation.clearWatch(watchId);
        this.habitIdToWatchId.delete(watchId);
    }

    getPosition() {
        // return new Promise((resolve, reject) => {
        //     navigator.geolocation.getCurrentPosition(
        //         (resp) => {
        //             this.handlePositionUpdate(resp);
        //             resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
        //         },
        //         (err) => {
        //             reject(err);
        //         }
        //     );
        // });
    }

    isWatchingLocation(habitId: string) {
        return this.habitIdToWatchId.has(habitId);
    }

    /**
     * TODO: figure out persistence flow
     * - Send location data every 5-10 seconds.
     * - Send updates when the user has moved more than 10-20 meters.
     */
    private handlePositionUpdate(habitId: string, resp: GeolocationPosition) {
        console.log(resp);
        const { longitude, latitude, accuracy, altitude } = resp.coords;
        console.log("Position updated: ", longitude, latitude);

        this.habitDataService.updateTrackingLocation(habitId, {
            timestamp: new Date(),
            coordinates: [
                {
                    lat: latitude,
                    lng: longitude,
                    accuracy,
                    altitude
                }
            ]
        });
    }

    private handleError(error: GeolocationPositionError) {
        console.error("Error: ", error);
    }
}
