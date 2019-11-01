import icon from '../../images/teller-logo-icon.png';

const DELAY = 5000;

export function askPermission() {
  return new Promise((resolve, reject) => {
    if (!("Notification" in window)) {
      reject(new Error('Notifications unavailable'));
    }
    const permissionResult = Notification.requestPermission((result) => {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then((permissionResult) => {
    if (permissionResult !== 'granted') {
      throw new Error('We weren\'t granted permission.');
    }
  });
}

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
  // Browser notification
  let notification;
  askPermission().then(() => {
    notification = new Notification(title, {body: description, icon});
    notification.onclose = clearFn;
    notification.onclick = onClick;
  }).catch(() => {
    // Nothing to do, it's just sad
  });

  // Dapp notification
  const myTimeout = setTimeout(() => {
    clearFn();
  }, DELAY);
  manager[notifFunc](description,
    title, DELAY, () => {
      clearTimeout(myTimeout);
      clearFn();
      if (notification) {
        notification.close();
      }
      if (onClick) {
        onClick();
      }
    });
}
