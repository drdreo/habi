import { Route } from "@angular/router";
import { AuthGuard } from "@auth0/auth0-angular";
import { PageNotFoundComponent } from "./errors/not-found/not-found.component";
import { LandingComponent } from "./landing/landing.component";

export const appRoutes: Route[] = [
    { path: "", component: LandingComponent },
    {
        path: "app",
        canActivate: [AuthGuard],
        loadComponent: () => import("./app-wrapper.component").then((m) => m.AppWrapperComponent),
        children: [
            {
                path: "home",
                loadComponent: () => import("./home/home.component").then((m) => m.HomeComponent)
            },
            {
                path: "calendar",
                loadComponent: () => import("./calendar/calendar.component").then((m) => m.CalendarComponent)
            },
            {
                path: "settings",
                loadComponent: () => import("./settings/settings.component").then((m) => m.SettingsComponent)
            },
            {
                path: "habit/:id",
                loadComponent: () =>
                    import("./habits/habit-details/habit-details.component").then((m) => m.HabitDetailsComponent)
            }
        ]
    },
    { path: "**", component: PageNotFoundComponent }
];
