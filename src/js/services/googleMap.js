export const API_KEY = 'AIzaSyALAskxuamVIKbyUiw6CxgfVTk6YM2wYu8';

const geocoder = require('google-geocoder');
const geo = geocoder({
  key: API_KEY
});

export function getLocation(place) {
  return new Promise((resolve, reject) => {

    geo.find(place, function(err, res) {
      if (err) {
        return reject(err);
      }
      if (!res.length) {
        return reject(new Error(`No result for location ${place}`));
      }
      resolve(res[0].location);
    });
  });
}
