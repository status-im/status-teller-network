const DELAY = 5000;

/**
 * Creates a notification using the react-notification NotificationManager and calls the clears and callbacks
 * @param {Object} manager  react-notification's NotificationManager
 * @param {string} notifFunc Notif function to call on the NotificationManager. Options: info, warning, error, success
 * @param {string} title Title of the notification
 * @param {string} description Description of the notification
 * @param {function} clearFn Function called to clear the notification
 * @param {function} onClick Optional effect on notification click
 * @return {void}
 */
export function createNotification(manager, notifFunc, title, description, clearFn, onClick) {
  const myTimeout = setTimeout(() => {
    clearFn();
  }, DELAY);
  manager[notifFunc](description,
    title, DELAY, () => {
      clearTimeout(myTimeout);
      clearFn();
      if (onClick) {
        onClick();
      }
    });
}
