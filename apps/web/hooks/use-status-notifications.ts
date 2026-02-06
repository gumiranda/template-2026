"use client";

import { useState, useCallback } from "react";
import type { StatusNotificationType } from "@/lib/types/dine-in";

interface NotificationState {
  type: StatusNotificationType;
  show: boolean;
}

export function useStatusNotifications() {
  const [notification, setNotification] = useState<NotificationState>({
    type: "order",
    show: false,
  });

  const showNotification = useCallback((type: StatusNotificationType) => {
    setNotification({ type, show: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  const showOrderStatus = useCallback(() => showNotification("order"), [showNotification]);
  const showWaiterStatus = useCallback(() => showNotification("waiter"), [showNotification]);
  const showBillStatus = useCallback(() => showNotification("bill"), [showNotification]);
  const showResetStatus = useCallback(() => showNotification("reset"), [showNotification]);

  return {
    notification,
    showOrderStatus,
    showWaiterStatus,
    showBillStatus,
    showResetStatus,
    hideNotification,
  };
}
