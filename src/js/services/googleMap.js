export const API_KEY = 'AIzaSyBudXYUykxdQZ7ljEdw9wCBpGNzofNWs7Q';

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
      resolve({location: res[0].location, countryCode: res[0].country.short_name});
    });
  });
}
