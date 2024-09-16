import { Pipe, PipeTransform } from "@angular/core";
import { Observable, of, timer } from "rxjs";
import { map } from "rxjs/operators";

const TIME_AGO_UPDATE_INTERVAL = 60 * 1_000; // 1 minute

@Pipe({
    name: "timeAgo",
    standalone: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | Date | unknown | undefined): Observable<string> {
        if (!value) {
            return of("");
        }

        const date = typeof value === "string" ? new Date(value) : value;
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return of("");
        }

        return timer(0, TIME_AGO_UPDATE_INTERVAL).pipe(map(() => this.getTimeAgo(date)));
    }

    private getTimeAgo(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < minute) {
            return "just now";
        } else if (diff < hour) {
            const minutes = Math.floor(diff / minute);
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        } else if (diff < day) {
            const hours = Math.floor(diff / hour);
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        } else {
            const days = Math.floor(diff / day);
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }
    }
}
