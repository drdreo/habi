import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatIconButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIcon } from "@angular/material/icon";
import { MatListModule, MatListSubheaderCssMatStyler } from "@angular/material/list";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { HabitCardComponent } from "../habits/habit-card/habit-card.component";
import { HabitEntryComponent } from "../habits/habit-entry/habit-entry.component";

@Component({
    selector: "app-home",
    standalone: true,
    imports: [
        CommonModule,
        HabitEntryComponent,
        MatDivider,
        MatListModule,
        MatIcon,
        MatListSubheaderCssMatStyler,
        MatIconButton,
        HabitCardComponent,
        MatGridListModule
    ],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    private http = inject(HttpClient);

    constructor() {
        setTimeout(async () => {
            const res = await firstValueFrom(this.http.get(`${environment.origins.api}/api/habits`));
            console.log(res);
        }, 1000);
    }
}
