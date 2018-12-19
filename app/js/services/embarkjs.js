import EmbarkJS from 'Embark/EmbarkJS';

export function onReady() {
  return new Promise((resolve, reject) => {
    EmbarkJS.onReady((err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}
