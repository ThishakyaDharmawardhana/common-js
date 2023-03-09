const assert = require('./assert'),
	is = require('./is');

module.exports = (() => {
	'use strict';

	/**
	 * Utilities for working with arrays.
	 *
	 * @public
	 * @module lang/array
	 */
	return {
		/**
		 * Returns the unique items from an array, where the unique
		 * key is determined via a strict equality check.
		 *
		 * @static
		 * @param {Array} a
		 * @returns {Array}
		 */
		unique(a) {
			assert.argumentIsArray(a, 'a');

			return this.uniqueBy(a, item => item);
		},

		/**
		 * Returns the unique items from an array, where the unique
		 * key is determined by a delegate.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Array}
		 */
		uniqueBy(a, keySelector) {
			assert.argumentIsArray(a, 'a');

			return a.filter((item, index, array) => {
				const key = keySelector(item);

				return array.findIndex(candidate => key === keySelector(candidate)) === index;
			});
		},

		/**
		 * Splits array into groups and returns an object (where the properties have
		 * arrays). Unlike the indexBy function, there can be many items which share
		 * the same key.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Object}
		 */
		groupBy(a, keySelector) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsRequired(keySelector, 'keySelector', Function);

			return a.reduce((groups, item) => {
				const key = keySelector(item);

				if (!groups.hasOwnProperty(key)) {
					groups[key] = [ ];
				}

				groups[key].push(item);

				return groups;
			}, { });
		},

		/**
		 * Splits array into groups and returns an array of arrays where the items of each
		 * nested array share a common key.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Array}
		 */
		batchBy(a, keySelector) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsRequired(keySelector, 'keySelector', Function);

			let currentKey = null;
			let currentBatch = null;

			return a.reduce((batches, item) => {
				const key = keySelector(item);

				if (currentBatch === null || currentKey !== key) {
					currentKey = key;

					currentBatch = [];
					batches.push(currentBatch);
				}

				currentBatch.push(item);

				return batches;
			}, []);
		},

		/**
		 * Splits array into groups and returns an object (where the properties are items from the
		 * original array). Unlike the {@link array#groupBy} function, only one item can have a
		 * given key value.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Object}
		 */
		indexBy(a, keySelector) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsRequired(keySelector, 'keySelector', Function);

			return a.reduce((map, item) => {
				const key = keySelector(item);

				if (map.hasOwnProperty(key)) {
					throw new Error('Unable to index array. A duplicate key exists.');
				}

				map[key] = item;

				return map;
			}, { });
		},

		/**
		 * Returns a new array containing all but the first item.
		 *
		 * @static
		 * @param {Array} a
		 * @returns {Array}
		 */
		dropLeft(a) {
			assert.argumentIsArray(a, 'a');

			let returnRef = Array.from(a);

			if (returnRef.length !== 0) {
				returnRef.shift();
			}

			return returnRef;
		},

		/**
		 * Returns a new array containing all but the last item.
		 *
		 * @static
		 * @param {Array} a
		 * @returns {Array}
		 */
		dropRight(a) {
			assert.argumentIsArray(a, 'a');

			let returnRef = Array.from(a);

			if (returnRef.length !== 0) {
				returnRef.pop();
			}

			return returnRef;
		},

		/**
		 * Returns the first item from an array, or an undefined value, if the
		 * array is empty.
		 *
		 * @static
		 * @param {Array} a
		 * @returns {*|undefined}
		 */
		first(a) {
			assert.argumentIsArray(a, 'a');

			let returnRef;

			if (a.length !== 0) {
				returnRef = a[0];
			} else {
				returnRef = undefined;
			}

			return returnRef;
		},

		/**
		 * Returns the last item from an array, or an undefined value, if the
		 * array is empty.
		 *
		 * @static
		 * @param {Array} a
		 * @returns {*|undefined}
		 */
		last(a) {
			assert.argumentIsArray(a, 'a');

			let returnRef;

			if (a.length !== 0) {
				returnRef = a[a.length - 1];
			} else {
				returnRef = undefined;
			}

			return returnRef;
		},

		/**
		 * Returns a copy of an array, replacing any item that is itself an array
		 * with the item's items.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Boolean=} recursive - If true, all nested arrays will be flattened.
		 * @returns {Array}
		 */
		flatten(a, recursive) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsOptional(recursive, 'recursive', Boolean);

			const empty = [];

			let flat = empty.concat.apply(empty, a);

			if (recursive && flat.some(x => is.array(x))) {
				flat = this.flatten(flat, true);
			}

			return flat;
		},

		/**
		 * Breaks an array into smaller arrays, returning an array of arrays.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Number} size - The maximum number of items per partition.
		 * @param {Array<Array>}
		 */
		partition(a, size) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsOptional(size, 'size', Number);

			const copy = a.slice(0);
			const partitions = [ ];

			while (copy.length !== 0) {
				partitions.push(copy.splice(0, size));
			}

			return partitions;
		},

		/**
		 * Set difference operation, returning any item in "a" that is not
		 * contained in "b" (using strict equality).
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @returns {Array}
		 */
		difference(a, b) {
			return this.differenceBy(a, b, item => item);
		},

		/**
		 * Set difference operation, returning any item in "a" that is not
		 * contained in "b" (where the uniqueness is determined by a delegate).
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Array}
		 */
		differenceBy(a, b, keySelector) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsArray(b, 'b');
			assert.argumentIsRequired(keySelector, 'keySelector', Function);

			const returnRef = [ ];

			a.forEach((candidate) => {
				const candidateKey = keySelector(candidate);

				const exclude = b.some(comparison => candidateKey === keySelector(comparison));

				if (!exclude) {
					returnRef.push(candidate);
				}
			});

			return returnRef;
		},

		/**
		 * Set symmetric difference operation (using strict equality). In
		 * other words, this is the union of the differences between the
		 * sets.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @returns {Array}
		 */
		differenceSymmetric(a, b) {
			return this.differenceSymmetricBy(a, b, item => item);
		},

		/**
		 * Set symmetric difference operation, where the uniqueness is determined by a delegate.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Array}
		 */
		differenceSymmetricBy(a, b, keySelector) {
			return this.unionBy(this.differenceBy(a, b, keySelector), this.differenceBy(b, a, keySelector), keySelector);
		},

		/**
		 * Set union operation (using strict equality).
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @returns {Array}
		 */
		union(a, b) {
			return this.unionBy(a, b, item => item);
		},

		/**
		 * Set union operation, where the uniqueness is determined by a delegate.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Array}
		 */
		unionBy(a, b, keySelector) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsArray(b, 'b');
			assert.argumentIsRequired(keySelector, 'keySelector', Function);

			const returnRef = a.slice();

			b.forEach((candidate) => {
				const candidateKey = keySelector(candidate);

				const exclude = returnRef.some(comparison => candidateKey === keySelector(comparison));

				if (!exclude) {
					returnRef.push(candidate);
				}
			});

			return returnRef;
		},

		/**
		 * Set intersection operation (using strict equality).
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @returns {Array}
		 */
		intersection(a, b) {
			return this.intersectionBy(a, b, item => item);
		},

		/**
		 * Set intersection operation, where the uniqueness is determined by a delegate.
		 *
		 * @static
		 * @param {Array} a
		 * @param {Array} b
		 * @param {Function} keySelector - A function that returns a unique key for an item.
		 * @returns {Array}
		 */
		intersectionBy(a, b, keySelector) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsArray(b, 'b');

			const returnRef = [ ];

			a.forEach((candidate) => {
				const candidateKey = keySelector(candidate);

				const include = b.some(comparison => candidateKey === keySelector(comparison));

				if (include) {
					returnRef.push(candidate);
				}
			});

			return returnRef;
		},

		/**
		 * Removes the first item from an array which matches a predicate.
		 *
		 * @static
		 * @public
		 * @param {Array} a
		 * @param {Function} predicate
		 * @returns {Boolean}
		 */
		remove(a, predicate) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsRequired(predicate, 'predicate', Function);

			const index = a.findIndex(predicate);
			const found = !(index < 0);

			if (found) {
				a.splice(index, 1);
			}

			return found;
		},

		/**
		 * Inserts an item into an array using a binary search is used to determine the
		 * proper point for insertion and returns the same array.
		 *
		 * @static
		 * @public
		 * @param {Array} a
		 * @param {*} item
		 * @param {Function} comparator
		 * @returns {Array}
		 */
		insert(a, item, comparator) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsRequired(comparator, 'comparator', Function);

			if (a.length === 0 || !(comparator(item, a[a.length - 1]) < 0)) {
				a.push(item);
			} else if (comparator(item, a[0]) < 0) {
				a.unshift(item);
			} else {
				a.splice(binarySearchForInsert(a, item, comparator, 0, a.length - 1), 0, item);
			}

			return a;
		},

		/**
		 * Performs a binary search to locate an item within an array.
		 *
		 * @param {*[]} a
		 * @param {*} key
		 * @param {Function} comparator
		 * @param {Number=} start
		 * @param {Number=} end
		 * @returns {*|null}
		 */
		binarySearch(a, key, comparator, start, end) {
			assert.argumentIsArray(a, 'a');
			assert.argumentIsRequired(comparator, 'comparator', Function);

			assert.argumentIsOptional(start, 'start', Number);
			assert.argumentIsOptional(end, 'end', Number);

			if (a.length === 0) {
				return null;
			}

			return binarySearchForMatch(a, key, comparator, start || 0, end || a.length - 1);
		}
	};

	function binarySearchForMatch(a, key, comparator, start, end) {
		const size = end - start;

		const midpointIndex = start + Math.floor(size / 2);
		const midpointItem = a[ midpointIndex ];

		const comparison = comparator(key, midpointItem);

		if (comparison === 0) {
			return midpointItem;
		} else if (size < 2) {
			const finalIndex = a.length - 1;
			const finalItem = a[ finalIndex ];

			if (end === finalIndex && comparator(key, finalItem) === 0) {
				return finalItem;
			} else {
				return null;
			}
		} else if (comparison > 0) {
			return binarySearchForMatch(a, key, comparator, midpointIndex, end);
		} else {
			return binarySearchForMatch(a, key, comparator, start, midpointIndex);
		}
	}

	function binarySearchForInsert(a, item, comparator, start, end) {
		const size = end - start;

		const midpointIndex = start + Math.floor(size / 2);
		const midpointItem = a[ midpointIndex ];

		const comparison = (comparator(item, midpointItem) > 0);

		if (size < 2) {
			if (comparison > 0) {
				const finalIndex = a.length - 1;

				if (end === finalIndex && comparator(item, a[ finalIndex ]) > 0) {
					return end + 1;
				} else {
					return end;
				}
			} else {
				return start;
			}
		} else if (comparison > 0) {
			return binarySearchForInsert(a, item, comparator, midpointIndex, end);
		} else {
			return binarySearchForInsert(a, item, comparator, start, midpointIndex);
		}
	}
})();