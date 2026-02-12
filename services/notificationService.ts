
export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (e) {
    console.error("Notification permission request failed", e);
    return false;
  }
};

export const sendWickAlert = (attyName: string) => {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Vape Management Pro", {
        body: `Your wick in ${attyName} has reached its limit. Flavor degradation likely.`,
        icon: "https://cdn-icons-png.flaticon.com/512/2611/2611152.png"
      });
    } catch (e) {
      console.error("Failed to send notification", e);
    }
  }
};
