import { describe, it, expect } from 'vitest';

import { deleteFrom, paramToArray } from '../miscHelpers.js';

describe('deleteFrom tests', () => {
  it('deleteFrom works properly and handles null array', () => {
    expect(deleteFrom(['a', 'b', 'c'], 'a')).toEqual(['b', 'c']);
    expect(deleteFrom(['a', 'b', 'c'], 1)).toEqual(['a', 'b', 'c']);
    expect(deleteFrom([], 'a')).toEqual([]);
    expect(deleteFrom('a', 'a')).toEqual([]);
  });
});

describe('paramToArray', () => {
  it('handles a missing param', () => expect(paramToArray({foo: 1}, 'bar')).toEqual([]));
  it('handles an array param', () => expect(paramToArray({foo: [1,2]}, 'foo')).toEqual([1,2]));
  it('handles an string param', () => expect(paramToArray({foo: 'bar'}, 'foo')).toEqual(['bar']));
})



