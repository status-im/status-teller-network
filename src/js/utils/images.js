export function getTokenImage(token) {
  const image = require(`./../../../node_modules/cryptocurrency-icons/svg/color/${token.toLowerCase()}.svg`);
  if (!image) {
    return require(`./../../../node_modules/cryptocurrency-icons/svg/color/generic.svg`);
  }
  return image;
}
