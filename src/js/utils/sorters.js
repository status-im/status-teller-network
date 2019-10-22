/* global web3 */
import { zeroAddress, addressCompare } from "./address";

export function weightedScore(user) {
  const upvotes = user.upCount + 4;
  const downvotes = user.downCount + 4;
  return upvotes / (upvotes + downvotes);
}

export function sortByDate(a, b) {
  // Using the id as there is no date in the contract
  if (a.id > b.id) return -1;
  if (a.id < b.id) return 1;
  return 0;
}

export const sortByMargin = (SNT) => {
  SNT = web3.utils.toChecksumAddress(SNT);

  return (a, b) => {
    const assetA = web3.utils.toChecksumAddress(a.asset);
    const assetB = web3.utils.toChecksumAddress(b.asset);

    const AisZero = addressCompare(assetA, zeroAddress);
    const BisZero = addressCompare(assetB, zeroAddress);
    const AisSNT = addressCompare(assetA, SNT);
    const BisSNT = addressCompare(assetB, SNT);

    // Returns SNT offers first, followed by ETH, and then the rest of the tokens
    if(AisZero && BisSNT) return 1;
    if(AisSNT && BisZero) return -1;
    if((AisZero || AisSNT) && !BisZero && !BisSNT) return -1;
    if((BisZero || BisSNT) && !AisZero && !BisSNT) return 1;

    if (assetA === assetB) {
      const marginA = parseInt(a.margin, 10);
      const marginB = parseInt(b.margin, 10);

      if (marginA > marginB) return 1;
      if (marginA < marginB) return -1;
    
      return 0;
  }
  
  return a.asset > b.asset ? 1 : -1;
  };
};

export function sortByRating(a, b) {
  const scoreA = weightedScore(a.user);
  const scoreB = weightedScore(b.user);
  if (scoreA > scoreB) return -1;
  if (scoreA < scoreB) return 1;
  return 0;
}
