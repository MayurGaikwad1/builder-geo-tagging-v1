import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavigationComponent } from "./components/navigation.component";
import { NotificationComponent } from "./components/notification.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavigationComponent, NotificationComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  protected readonly title = signal(
    "Geo-Tagging Module - Location & Partner Management",
  );
}
