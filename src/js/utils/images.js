const genericImage = require(`./../../../node_modules/cryptocurrency-icons/svg/color/generic.svg`);

export function getTokenImage(token) {
  if (!token) {
    return genericImage;
  }
  try {
    return require(`./../../../node_modules/cryptocurrency-icons/svg/color/${token.toLowerCase()}.svg`);
  } catch (_e) {
    return genericImage;
  }
}
