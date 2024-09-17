type NotificationType = 'success' | 'error' | 'info';

export function showNotification(message: string, type: NotificationType) {
  // For now, we'll just log to the console
  // In a real application, you'd want to show a UI notification
  console.log(`[${type.toUpperCase()}]: ${message}`);
  
  // You can implement a more sophisticated notification system here
  // For example, using a library like react-toastify or a custom component
}