import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";

interface Oninit {}

@Component({
    selector: "tracking-map",
    standalone: true,
    imports: [CommonModule, GoogleMapsModule],
    templateUrl: "./maps.component.html",
    styleUrl: "./maps.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements Oninit {
    center = { lat: 0, lng: 0 };
    zoom = 14;
    path: any[] = [];
    polylineOptions = {
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3
    };

    ngOnInit() {
        // Replace with real data from MongoDB backend
        const locationData = this.getTrackingData();

        this.path = locationData.map((point) => ({
            lat: point.coords.lat,
            lng: point.coords.lng
        }));

        // Set the map's center to the first location
        if (this.path.length > 0) {
            this.center = this.path[0];
        }
    }

    getTrackingData() {
        // Mock data, replace this with a real API call to fetch session data
        return [
            { timestamp: 1662100000000, coords: { lat: 59.6410368, lng: 16.5445632 } },
            { timestamp: 1662100100000, coords: { lat: 59.6410368, lng: 16.5445632 } }
        ];
    }
}
