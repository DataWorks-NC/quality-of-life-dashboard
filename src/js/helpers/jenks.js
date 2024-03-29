// # [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
//
// Source: https://macwright.com/2013/02/18/literate-jenks.html
// TODO: Consider replacing with Ckmeans or equal interval breaks.
//
// Implementations: [1](http://danieljlewis.org/files/2010/06/Jenks.pdf) (python),
// [2](https://github.com/vvoovv/djeo-jenks/blob/master/main.js) (buggy),
// [3](https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407) (works)
/* eslint-disable */
export default function jenks(data, n_classes) {
  // Compute the matrices required for Jenks breaks. These matrices
  // can be used for any classing of data with `classes <= n_classes`
  function getMatrices(data, n_classes) {
    // in the original implementation, these matrices are referred to
    // as `LC` and `OP`
    //
    // * lower_class_limits (LC): optimal lower class limits
    // * variance_combinations (OP): optimal variance combinations for all classes
    const lower_class_limits = [];
    const variance_combinations = [];
    // loop counters
    let i; let j;
    // the variance, as computed at each step in the calculation
    let variance = 0;

    // Initialize and fill each matrix with zeroes
    for (i = 0; i < data.length + 1; i++) {
      const tmp1 = []; const
        tmp2 = [];
      for (j = 0; j < n_classes + 1; j++) {
        tmp1.push(0);
        tmp2.push(0);
      }
      lower_class_limits.push(tmp1);
      variance_combinations.push(tmp2);
    }

    for (i = 1; i < n_classes + 1; i++) {
      lower_class_limits[1][i] = 1;
      variance_combinations[1][i] = 0;
      // in the original implementation, 9999999 is used but
      // since Javascript has `Infinity`, we use that.
      for (j = 2; j < data.length + 1; j++) {
        variance_combinations[j][i] = Infinity;
      }
    }

    for (let l = 2; l < data.length + 1; l++) {
      // `SZ` originally. this is the sum of the values seen thus
      // far when calculating variance.
      let sum = 0;
      // `ZSQ` originally. the sum of squares of values seen
      // thus far
      let sum_squares = 0;
      // `WT` originally. This is the number of
      let w = 0;
      // `IV` originally
      let i4 = 0;

      // in several instances, you could say `Math.pow(x, 2)`
      // instead of `x * x`, but this is slower in some browsers
      // introduces an unnecessary concept.
      for (let m = 1; m < l + 1; m++) {
        // `III` originally
        const lower_class_limit = l - m + 1;
        const val = data[lower_class_limit - 1];

        // here we're estimating variance for each potential classing
        // of the data, for each potential number of classes. `w`
        // is the number of data points considered so far.
        w++;

        // increase the current sum and sum-of-squares
        sum += val;
        sum_squares += val * val;

        // the variance at this point in the sequence is the difference
        // between the sum of squares and the total x 2, over the number
        // of samples.
        variance = sum_squares - (sum * sum) / w;

        i4 = lower_class_limit - 1;

        if (i4 !== 0) {
          for (j = 2; j < n_classes + 1; j++) {
            // if adding this element to an existing class
            // will increase its variance beyond the limit, break
            // the class at this point, setting the lower_class_limit
            // at this point.
            if (variance_combinations[l][j]
              >= (variance + variance_combinations[i4][j - 1])) {
              lower_class_limits[l][j] = lower_class_limit;
              variance_combinations[l][j] = variance
                + variance_combinations[i4][j - 1];
            }
          }
        }
      }

      lower_class_limits[l][1] = 1;
      variance_combinations[l][1] = variance;
    }

    // return the two matrices. for just providing breaks, only
    // `lower_class_limits` is needed, but variances can be useful to
    // evaluage goodness of fit.
    return {
      lower_class_limits,
      variance_combinations,
    };
  }

  // the second part of the jenks recipe: take the calculated matrices
  // and derive an array of n breaks.
  function breaks(data, lower_class_limits, n_classes) {
    let k = data.length - 1;
    const kclass = [];
    let countNum = n_classes;

    // the calculation of classes will never include the upper and
    // lower bounds, so we need to explicitly set them
    kclass[n_classes] = data[data.length - 1];
    kclass[0] = data[0];

    // the lower_class_limits matrix is used as indexes into itself
    // here: the `k` variable is reused in each iteration.
    while (countNum > 1) {
      kclass[countNum - 1] = data[lower_class_limits[k][countNum] - 2];
      k = lower_class_limits[k][countNum] - 1;
      countNum--;
    }

    return kclass;
  }

  if (n_classes > data.length) return null;

  // sort data in numerical order, since this is expected
  // by the matrices function
  data = data.slice().sort((a, b) => a - b);

  // get our basic matrices
  const matrices = getMatrices(data, n_classes);
  // we only need lower class limits here
  const lower_class_limits = matrices.lower_class_limits;

  // extract n_classes out of the computed matrices
  return breaks(data, lower_class_limits, n_classes);
}
