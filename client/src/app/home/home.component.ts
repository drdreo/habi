import { BreakpointObserver, Breakpoints, LayoutModule } from "@angular/cdk/layout";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
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
        MatGridListModule,
        LayoutModule
    ],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    numCols = signal(4);
    private http = inject(HttpClient);
    habits = [
        { id: 1, title: "Exercise for 30 Minutes" },
        { id: 2, title: "Drink 8 Glasses of Water" },
        { id: 3, title: "Meditate" }
    ];
    private breakpointObserver = inject(BreakpointObserver);

    constructor() {
        setTimeout(async () => {
            const res = await firstValueFrom(this.http.get(`${environment.origins.api}/api/habits`));
            console.log(res);
        }, 1000);

        this.breakpointObserver.observe([Breakpoints.HandsetLandscape]).subscribe((result) => {
            if (result.matches) {
                this.numCols.set(2);
            }
            console.log(result);
        });
    }
}
