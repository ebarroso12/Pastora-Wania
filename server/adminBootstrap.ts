export function getAdminBootstrapStatus() {
  return {
    initialAdminPasswordConfigured:
      typeof process.env.INITIAL_ADMIN_PASSWORD === "string" &&
      process.env.INITIAL_ADMIN_PASSWORD.trim().length >= 8,
    leadRecipientConfigured:
      typeof process.env.LEAD_NOTIFICATION_RECIPIENTS === "string" &&
      process.env.LEAD_NOTIFICATION_RECIPIENTS.includes("@"),
  } as const;
}
