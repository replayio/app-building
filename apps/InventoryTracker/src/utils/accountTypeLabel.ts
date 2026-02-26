/** Maps database account_type values to AppSpec display labels. */
export function accountTypeLabel(accountType: string): string {
  switch (accountType) {
    case "stock":
      return "Inventory Account";
    case "input":
      return "Consumer Account";
    case "output":
      return "Producer Account";
    default:
      return accountType.charAt(0).toUpperCase() + accountType.slice(1);
  }
}
