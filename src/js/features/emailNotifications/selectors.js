export const isSubscribed = state => state.emailNotifications.isSubscribed;

export const email = state => state.emailNotifications.email;

export const redirectTarget = state => state.emailNotifications.redirectTarget;

export const error = state => state.emailNotifications.error;

export const working = state => state.emailNotifications.working;

export const subscribeSuccess = state => state.emailNotifications.subscribeSuccess;

export const verifySuccess = state => state.emailNotifications.verifySuccess;

export const refusedEmailNotifications = state => state.emailNotifications.refusedEmailNotifications;

export const hideSignatureWarning = state => state.emailNotifications.hideSignatureWarning;
