function importAll(r) {
  let images = {};
  r.keys().map((item) => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

export const TokenImages = importAll(require.context('../../images/tokens', false, /\.(png)$/));
