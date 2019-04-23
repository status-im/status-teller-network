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

export function sortByRating(a, b) {
  const scoreA = weightedScore(a.user);
  const scoreB = weightedScore(b.user);
  if (scoreA > scoreB) return -1;
  if (scoreA < scoreB) return 1;
  return 0;
}
