/*global google*/
export const API_KEY = 'AIzaSyBudXYUykxdQZ7ljEdw9wCBpGNzofNWs7Q'; // Caution: this is used in index.html too
const geocoder = new google.maps.Geocoder();

export function getLocation(place) {
  return new Promise((resolve, reject) => {

    geocoder.geocode({address: place}, (results, status) => {
      if (status === 'OK') {
        resolve({
          location: {
            latitude: results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng()
          }, countryCode: results[0].address_components[3].short_name
        });
      } else {
        return reject(new Error(`No result for location ${place}. Status: ${status}`));
      }
    });
  });
}
