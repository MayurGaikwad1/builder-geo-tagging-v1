import { Injectable, signal } from "@angular/core";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private idCounter = 0;

  // Public readonly signal
  public readonly activeNotifications = this.notifications.asReadonly();

  show(
    type: Notification["type"],
    title: string,
    message: string,
    autoClose = true,
    duration = 5000,
  ): string {
    const id = `notification_${++this.idCounter}`;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      autoClose,
      duration,
    };

    // Add to notifications array
    this.notifications.update((notifications) => [
      ...notifications,
      notification,
    ]);

    // Auto-close if specified
    if (autoClose) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  success(title: string, message: string, autoClose = true): string {
    return this.show("success", title, message, autoClose);
  }

  error(title: string, message: string, autoClose = false): string {
    return this.show("error", title, message, autoClose);
  }

  warning(title: string, message: string, autoClose = true): string {
    return this.show("warning", title, message, autoClose);
  }

  info(title: string, message: string, autoClose = true): string {
    return this.show("info", title, message, autoClose);
  }

  dismiss(id: string): void {
    this.notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id),
    );
  }

  dismissAll(): void {
    this.notifications.set([]);
  }

  // Convenience method for location errors with instructions
  showLocationError(message: string, instructions?: string): string {
    const fullMessage = instructions
      ? `${message}\n\nClick to see detailed instructions for your browser.`
      : message;

    return this.error("Location Access Required", fullMessage);
  }

  // Convenience method for location success
  showLocationSuccess(message: string): string {
    return this.success("Location Updated", message);
  }
}
