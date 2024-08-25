import { Route } from "@angular/router";
import { AuthGuard } from "@auth0/auth0-angular";
import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";

export const appRoutes: Route[] = [
    { path: "", component: LandingComponent },
    {
        path: "home",
        component: HomeComponent,
        canActivate: [AuthGuard]
    }
];
