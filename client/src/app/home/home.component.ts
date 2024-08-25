import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Component({
    selector: "app-home",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    private http = inject(HttpClient);

    constructor() {
        setTimeout(async () => {
            const res = await firstValueFrom(
                this.http.get("http://localhost:3333/api/habits/123", { responseType: "text" })
            );
            console.log(res);
        }, 2000);
    }
}
