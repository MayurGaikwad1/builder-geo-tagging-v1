import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NotificationService,
  Notification,
} from "../services/notification.service";

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-4" style="max-width: 400px;">
      <div
        *ngFor="
          let notification of notificationService.activeNotifications();
          trackBy: trackById
        "
        class="notification-container transform transition-all duration-300 ease-in-out"
        [class]="getNotificationClasses(notification)"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              class="w-5 h-5 mt-0.5"
              [innerHTML]="getNotificationIcon(notification.type)"
            ></svg>
          </div>
          <div class="ml-3 flex-1">
            <h4 class="text-sm font-semibold">{{ notification.title }}</h4>
            <p class="text-sm mt-1 whitespace-pre-line">
              {{ notification.message }}
            </p>
          </div>
          <div class="flex-shrink-0 ml-4">
            <button
              (click)="dismiss(notification.id)"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-container {
        @apply max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border-l-4;
        animation: slideIn 0.3s ease-out;
      }

      .notification-success {
        @apply border-success-400 text-success-700;
      }

      .notification-error {
        @apply border-red-400 text-red-700;
      }

      .notification-warning {
        @apply border-warning-400 text-warning-700;
      }

      .notification-info {
        @apply border-primary-400 text-primary-700;
      }

      .notification-container {
        padding: 1rem;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class NotificationComponent {
  notificationService = inject(NotificationService);

  trackById(index: number, notification: Notification): string {
    return notification.id;
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getNotificationClasses(notification: Notification): string {
    const baseClasses = "notification-container";
    const typeClass = `notification-${notification.type}`;
    return `${baseClasses} ${typeClass}`;
  }

  getNotificationIcon(type: Notification["type"]): string {
    switch (type) {
      case "success":
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>';
      case "error":
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>';
      case "warning":
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>';
      case "info":
      default:
        return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
    }
  }
}
