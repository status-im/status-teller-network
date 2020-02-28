import {Loader} from 'google-maps';

export const API_KEY = 'AIzaSyBudXYUykxdQZ7ljEdw9wCBpGNzofNWs7Q'; // Caution: this is used in index.html too

class GoogleLoader {
  async loadGoogle() {
    if (this.googleObj) {
      return this.googleObj;
    }
    if (this.loading) {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (this.googleObj) {
            clearInterval(interval);
            return resolve(this.googleObj);
          }
          if (this.error) {
            clearInterval(interval);
            reject(this.error);
          }
        });
      });
    }

    try {
      const loader = new Loader(API_KEY, {});

      this.loading = true;
      this.googleObj = await loader.load();
      this.loading = false;
      return this.googleObj;
    } catch (e) {
      this.error = e;
      throw e;
    }
  }
}

const googleLoader = new GoogleLoader();

export async function getLocation(place) {
  const googleObj = await googleLoader.loadGoogle();

  const geocoder = new googleObj.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({address: place}, (results, status) => {
      if (status !== 'OK') {
        return reject(new Error(`No result for location ${place}. Status: ${status}`));
      }
      resolve({
        location: {
          latitude: results[0].geometry.location.lat(),
          longitude: results[0].geometry.location.lng()
        }, countryCode: results[0].address_components[results[0].address_components.length - 1].short_name
      });
    });
  });
}
