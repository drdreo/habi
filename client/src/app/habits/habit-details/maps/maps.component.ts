import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    OnInit,
    Signal,
    signal
} from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";
import { HabitDataService } from "../../habit.data.service";
import { TrackingSession } from "../../habit.model";

@Component({
    selector: "tracking-map",
    standalone: true,
    imports: [CommonModule, GoogleMapsModule],
    templateUrl: "./maps.component.html",
    styleUrl: "./maps.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
    zoom = 14;
    center: Signal<{ lat: number; lng: number }>;
    path = signal<{ lat: number; lng: number }[]>([]);
    polylineOptions = {
        strokeColor: "#C42847",
        strokeOpacity: 1.0,
        strokeWeight: 5
    };
    options: google.maps.MapOptions = {
        mapTypeId: "hybrid"
    };

    habitId = input<string | undefined>();

    private habitDataService = inject(HabitDataService);

    constructor() {
        effect(async () => {
            const habitId = this.habitId();
            if (habitId) {
                const sess = await this.habitDataService.getTrackingSession(habitId);
                console.log(sess);
                const trackingData = this.getTrackingDataFromBackend(sess);
                console.log({ trackingData });
                this.path.set(trackingData);
            }
        });

        this.center = computed(() => {
            if (this.path().length === 0) {
                return { lat: 0, lng: 0 };
            }
            return this.path()[0];
        });
    }

    ngOnInit() {
        // Replace with real data from MongoDB backend
        const locationData = this.getTrackingDataMock();

        this.path.set(
            locationData.map((point) => ({
                lat: point.coords.lat,
                lng: point.coords.lng
            }))
        );
    }

    getTrackingDataMock() {
        // Mock data, replace this with a real API call to fetch session data
        return [
            { timestamp: 1662100000000, coords: { lat: 59.6410368, lng: 16.5445632 } },
            { timestamp: 1662100100000, coords: { lat: 59.6410368, lng: 16.5445632 } }
        ];
    }

    getTrackingDataFromBackend(trackingSession: TrackingSession): { lat: number; lng: number }[] {
        // Replace this with real data from MongoDB backend
        return trackingSession.location.coordinates.map((coords) => ({
            lng: coords[0],
            lat: coords[1]
        }));
    }
}
