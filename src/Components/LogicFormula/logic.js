function convertToSqft(kanal, marla, sqft) {
  return kanal * 5445 + marla * 272.25 + sqft;
}

function convertFromSqft(totalSqft) {
  const kanal = Math.floor(totalSqft / 5445);
  totalSqft %= 5445;

  const marla = Math.floor(totalSqft / 272.25);
  totalSqft %= 272.25;

  const sqft = parseFloat(totalSqft.toFixed(2)); // Round to 2 decimal places
  return { kanal, marla, sqft };
}

function addRaqba(k1, m1, s1, k2, m2, s2) {
  const totalSqft1 = convertToSqft(k1, m1, s1);
  const totalSqft2 = convertToSqft(k2, m2, s2);
  const resultSqft = totalSqft1 + totalSqft2;
  return convertFromSqft(resultSqft);
}

function subtractRaqba(k1, m1, s1, k2, m2, s2) {
  const totalSqft1 = convertToSqft(k1, m1, s1);
  const totalSqft2 = convertToSqft(k2, m2, s2);
  const resultSqft = totalSqft1 - totalSqft2;

  if (resultSqft < 0) {
    return "Invalid: Negative Raqba";
  }

  return convertFromSqft(resultSqft);
}
