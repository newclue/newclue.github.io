// Bad square root function
// `precision` must not exceed 16 or the square will overflow Number type at 32+ digits.
function sqrt(n, precision) {
  var rt = 0;
  var sq = 0, prev;
  var q = 0;
  do {
    sq = (100 * sq) + (100 * rt) + 25;
    rt = (10 * rt) + 5;
    if (sq < n) {
      do {
        prev = sq;
        sq = sq + (2 * rt) + 1;
        rt++;;
      } while (sq < n);
      sq = prev;
      rt--;
    }
    else if (sq > n) {
      do {
        sq = sq - ((2 * rt) - 1);
        rt--;
      } while (sq > n);
    }
    n *= 100;
    q++;
  } while (q <= precision);
  rt *= 1 / Math.pow(10, precision);
  return rt;
}

