(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const QuineMcCluskey = require("./quinemccluskey.js");

let addBtn = document.getElementById("addBtn");
addBtn.addEventListener("click", function (e) {
  let numOfvar = document.getElementById("numberOfVar");
  let box = document.getElementById("checkForDont");
  let minterms = document.getElementById("Minterms");
  let dontcare = document.getElementById("Dont-care");
  let str = "";
  const mintermarray = [];
  const dontarray = [];
  for (let index = 0; index < numOfvar.value; index++) {
    str = str + String.fromCharCode(65 + index);
  }
  let minterstring = minterms.value;
  for (let index = 0; index < minterstring.length; index++) {
    if (minterstring[index] != ",") mintermarray.push(minterstring[index]);
  }
  let dontstr = dontcare.value;
  for (let index = 0; index < dontstr.length; index++) {
    if (dontstr[index] != ",") dontarray.push(dontstr[index]);
  }
  //   if (dontarray.length == 0) {
  //     const f = new QuineMcCluskey(str, mintermarray);
  //     alert("the answer = " + f.getFunction());
  //   } else {
  //     const f = new QuineMcCluskey(str, mintermarray, dontarray);
  //     alert(f.getFunction());
  //   }
  // console.log(f.getFunction())//Sick
  const f = new QuineMcCluskey(str, mintermarray, dontarray);
  alert("The minimized expression using QM method = " + f.getFunction());
  //   const f = new QuineMcCluskey(str, mintermarray);
  //   alert(f.getFunction());
});

},{"./quinemccluskey.js":3}],2:[function(require,module,exports){
/**
 * A class to hold information about a minterm when using the Quine-McCluskey Algorithm
 */
module.exports = class Minterm {
  /**
   * Creates a new minterm object
   */
  constructor(values, value) {
    this.values = values;
    this.value = value;
    this.used = false;

    this.values.sort(function (number1, number2) {
      return number1 > number2;
    });
  }

  /**
   * Returns a String representation of the Minterm
   */
  toString() {
    let values = this.values.join(", ");
    return `m(${values}) = ${this.value}`;
  }

  /**
   * Determines if this Minterm object is equal to another object
   */
  equals(minterm) {
    if (!(minterm instanceof Minterm)) {
      return false;
    }

    return (
      this.value == minterm.value &&
      this.values.length == minterm.values.length &&
      this.values.every(function (u, i) {
        return u === minterm.values[i];
      })
    );
  }

  /**
   * Returns the values in this Minterm
   */
  getValues() {
    return this.values;
  }

  /**
   * Returns the binary value of this Minterm
   */
  getValue() {
    return this.value;
  }

  /**
   * Returns whether or not this Minterm has been used
   */
  isUsed() {
    return this.used;
  }

  /**
   * Labels this Minterm as "used"
   */
  use() {
    this.used = true;
  }

  /**
   * Combines 2 Minterms together if they can be combined
   */
  combine(minterm) {
    // Check if this value is this same; If so, do nothing
    if (this.value == minterm.value) {
      return null;
    }

    // Check if the values are the same; If so, do nothing
    if (
      this.values.length == minterm.values.length &&
      this.values.every(function (u, i) {
        return u === minterm.values[i];
      })
    ) {
      return null;
    }

    // Keep track of the difference between the minterms
    let diff = 0;
    let result = "";

    // Iterate through the bits in this Minterm's value
    for (const i in this.value) {
      // Check if the current bit value differs from the minterm's bit value
      if (this.value.charAt(i) != minterm.value.charAt(i)) {
        diff += 1;
        result += "-";
      }

      // There is no difference
      else {
        result += this.value.charAt(i);
      }

      // The difference has exceeded 1
      if (diff > 1) {
        return null;
      }
    }

    return new Minterm(this.values.concat(minterm.values), result);
  }
};

},{}],3:[function(require,module,exports){
const Minterm = require("./minterm.js");
const { decToBin, valueIn } = require("./util");

/**
 * A class to handle processing the Quine-McCluskey Algorithm
 */
module.exports = class QuineMcCluskey {
  /**
   * Creates a new QuineMcCluskey object to process the Quine-Mccluskey Algorithm
   */
  constructor(variables, values, dontCares = [], isMaxterm = false) {
    values.sort();
    this.variables = variables;
    this.values = values;
    this.allValues = values.concat(dontCares);
    this.allValues.sort();
    this.dontCares = dontCares;
    this.isMaxterm = isMaxterm;
    this.func = null;
    this.func = this.getFunction();
  }

  // Helper Methods

  /**
   * Returns the binary value equivalent to the decimal value given
   */
  getBits(value) {
    let s = (value >>> 0).toString(2);
    for (let i = s.length; i < this.variables.length; i++) s = "0" + s;
    return s;
  }

  // Grouping Methods

  /**
   * Creates the initial grouping for the bits from the values
   * given to the Quine-McCluskey Algorithm
   */
  initialGroup() {
    // Keep track of groups by 2-dimensional array
    let groups = [];
    for (let i = 0; i < this.variables.length + 1; i++) {
      groups.push([]);
    }

    // Iterate through values
    for (const value of this.allValues) {
      // Count number of 1's in value's bit equivalent
      let count = 0;
      let bits = this.getBits(value);
      for (const bit of bits) {
        if (bit == "1") {
          count += 1;
        }
      }

      // Add count to proper group
      groups[count].push(new Minterm([value], bits));
    }

    return groups;
  }

  /**
   * Creates a power set of all valid prime implicants that covers the rest of an expression.
   * This is used after the essential prime implicants have been found.
   */
  powerSet(values, primeImplicants) {
    // Get the power set of all the prime implicants
    let powerset = [];

    // Iterate through decimal values from 1 to 2 ** size - 1
    for (let i = 1; i < 2 ** primeImplicants.length - 1; i++) {
      let currentset = [];

      // Get the binary value of the decimal value
      let binValue = decToBin(i);
      for (let j = binValue.length; j < primeImplicants.length; j++) {
        binValue = "0" + binValue;
      }

      // Find which indexes have 1 in the binValue string
      for (let j = 0; j < binValue.length; j++) {
        if (binValue.charAt(j) == "1") {
          currentset.push(primeImplicants[j]);
        }
      }
      powerset.push(currentset);
    }

    // Remove all subsets that do not cover the rest of the implicants
    let newpowerset = [];
    for (const subset of powerset) {
      // Get all the values the set covers
      let tempValues = [];
      for (const implicant of subset) {
        for (const value of implicant.getValues()) {
          if (!valueIn(value, tempValues) && valueIn(value, values)) {
            tempValues.push(value);
          }
        }
      }
      tempValues.sort(function (number1, number2) {
        return number1 > number2;
      });

      // Check if this subset covers the rest of the values
      if (
        tempValues.length == values.length &&
        tempValues.every(function (u, i) {
          return u === values[i];
        })
      ) {
        newpowerset.push(subset);
      }
    }
    powerset = newpowerset;

    // Find the minimum amount of implicants that can cover the expression
    let minSet = powerset[0];
    for (const subset of powerset) {
      if (subset.length < minSet.length) {
        minSet = subset;
      }
    }

    if (minSet == undefined) {
      return [];
    }
    return minSet;
  }

  // Compare Methods

  /**
   * Returns an array of all the prime implicants for an expression
   */
  getPrimeImplicants(groups = null) {
    // Get initial group if group is null
    if (groups === null) {
      groups = this.initialGroup();
    }

    // If there is only 1 group, return all the minterms in it
    if (groups.length == 1) {
      return groups[0];
    }

    // Try comparing the rest
    else {
      let unused = [];
      let comparisons = [...Array(groups.length - 1).keys()];
      let newGroups = [];
      for (let i of comparisons) {
        newGroups.push([]);
      }

      // Compare each adjacent group
      for (const compare of comparisons) {
        let group1 = groups[compare];
        let group2 = groups[compare + 1];

        // Compare every term in group1 with every term in group2
        for (const term1 of group1) {
          for (const term2 of group2) {
            // Try combining it
            let term3 = term1.combine(term2);

            // Only add it to the new group if term3 is not null
            //  term3 will only be null if term1 and term2 could not
            //  be combined
            if (term3 !== null) {
              term1.use();
              term2.use();
              if (!valueIn(term3, newGroups[compare])) {
                newGroups[compare].push(term3);
              }
            }
          }
        }
      }

      // Get array of all unused minterms
      for (const group of groups) {
        for (const term of group) {
          if (!term.isUsed() && !valueIn(term, unused)) {
            unused.push(term);
          }
        }
      }

      // Add recursive call
      for (const term of this.getPrimeImplicants(newGroups)) {
        if (!term.isUsed() && !valueIn(term, unused)) {
          unused.push(term);
        }
      }

      return unused;
    }
  }

  // Solving Methods

  /**
   * Solves for the expression returning the minimal amount of prime implicants needed
   * to cover the expression.
   */
  solve() {
    // Get the prime implicants
    let primeImplicants = this.getPrimeImplicants();

    // Keep track of values with only 1 implicant
    //  These are the essential prime implicants
    let essentialPrimeImplicants = [];
    let valuesUsed = [];
    for (let i = 0; i < this.values.length; i++) {
      valuesUsed.push(false);
    }

    // Iterate through values
    for (let i = 0; i < this.values.length; i++) {
      let value = this.values[i];

      let uses = 0;
      let last = null;
      for (const minterm of primeImplicants) {
        if (valueIn(value, minterm.getValues())) {
          uses += 1;
          last = minterm;
        }
      }
      if (uses == 1 && !valueIn(last, essentialPrimeImplicants)) {
        for (const v of last.getValues()) {
          if (!valueIn(v, this.dontCares)) {
            valuesUsed[this.values.indexOf(v)] = true;
          }
        }
        essentialPrimeImplicants.push(last);
      }
    }

    // Check if all values were used
    let found = false;
    for (const value of valuesUsed) {
      if (!value) {
        found = true;
        break;
      }
    }
    if (!found) {
      return essentialPrimeImplicants;
    }

    // Keep track of prime implicants that cover as many values as possible
    //  with as few variables as possible
    let newPrimeImplicants = [];
    for (const implicant of primeImplicants) {
      if (!valueIn(implicant, essentialPrimeImplicants)) {
        // Check if the current implicant only consists of dont cares
        let add = false;
        for (const value of implicant.getValues()) {
          if (!valueIn(value, this.dontCares)) {
            add = true;
            break;
          }
        }
        if (add) {
          newPrimeImplicants.push(implicant);
        }
      }
    }
    primeImplicants = newPrimeImplicants;

    // Check if there is only 1 implicant left (very rare but just in case)
    if (primeImplicants.length == 1) {
      return essentialPrimeImplicants.concat(primeImplicants);
    }

    // Create a power set from the remaining prime implicants and check which
    //  combination of prime implicants gets the simplest form
    let newValues = [];
    for (let i = 0; i < this.values.length; i++) {
      if (!valuesUsed[i]) {
        newValues.push(this.values[i]);
      }
    }

    let tempset = this.powerSet(newValues, primeImplicants);

    return essentialPrimeImplicants.concat(
      this.powerSet(newValues, primeImplicants)
    );
  }

  /**
   * Returns the expression in a readable form
   */
  getFunction() {
    // Check if function already exists, return it
    if (this.func != null) {
      return this.func;
    }

    // Get the prime implicants and variables
    let primeImplicants = this.solve();

    // Check if there are no prime implicants; Always False
    if (primeImplicants.length == 0) {
      return "0";
    }

    if (primeImplicants.length == 1) {
      let count = 0;
      for (const index of primeImplicants[0].getValue()) {
        if (index == "-") {
          count += 1;
        }
      }
      if (count == this.variables.length) {
        return "1";
      }
    }

    let result = "";

    // Iterate through the prime implicants
    for (let i = 0; i < primeImplicants.length; i++) {
      let implicant = primeImplicants[i];

      // Add parentheses if necessary
      if (
        (implicant.getValue().match(/-/g) || []).length <
        this.variables.length - 1
      ) {
        result += "(";
      }

      // Iterate through all the bits in the implicants value
      for (let j = 0; j < implicant.getValue().length; j++) {
        if (implicant.getValue().charAt(j) == (this.isMaxterm ? "1" : "0")) {
          result += "NOT ";
        }
        if (implicant.getValue().charAt(j) != "-") {
          result += this.variables[j];
        }
        if (
          (
            implicant
              .getValue()
              .substring(j + 1)
              .match(/-/g) || []
          ).length <
            implicant.getValue().length - j - 1 &&
          implicant.getValue().charAt(j) != "-"
        ) {
          result += this.isMaxterm ? " OR " : " AND ";
        }
      }

      // Add parentheses if necessary
      if (
        (implicant.getValue().match(/-/g) || []).length <
        this.variables.length - 1
      ) {
        result += ")";
      }

      // Combine minterms with an OR operator
      if (i < primeImplicants.length - 1) {
        result += this.isMaxterm ? " AND " : " OR ";
      }
    }

    return result;
  }
};

},{"./minterm.js":2,"./util":4}],4:[function(require,module,exports){
const Minterm = require("./minterm.js");

/**
 * Converts a value from decimal to binary
 *
 * @param value The value to convert to binary
 */
function decToBin(value) {
  return (value >>> 0).toString(2);
}

/**
 * Returns whether or not a value is in an array
 *
 * @param value The value to look for in an array
 * @param array The array to look for a value in
 */
function valueIn(value, array) {
  for (const compare of array) {
    if (compare == value) {
      return true;
    }

    if (value instanceof Minterm) {
      if (compare.equals(value)) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  decToBin,
  valueIn,
};

},{"./minterm.js":2}]},{},[1]);
