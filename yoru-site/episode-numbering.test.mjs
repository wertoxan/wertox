import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeReleaseNumbering} from './episode-numbering.mjs';

const rules = [{releaseId:'demo-release', catalogId:'demo-series', original:'Paper Planet II', year:2030, count:3, offset:6}];
const sample = {releaseId:'demo-release', catalogId:'demo-series', original:'Paper Planet II', year:2030, type:'TV', episodes:3, episodeNumbers:[7,8,9]};

test('normalize a complete, matching release and preserve original numbering', () => {
  const result = normalizeReleaseNumbering(sample,rules);
  assert.deepEqual(result.episodeNumbers,[1,2,3]);
  assert.deepEqual(result.sourceEpisodeNumbers,[7,8,9]);
  assert.equal(result.episodeNumberOffset,6);
  assert.deepEqual(sample.episodeNumbers,[7,8,9]);
});

test('do not normalize unrelated, missing, local, or duplicate numbers', () => {
  for (const change of [{catalogId:'other'},{year:2031},{type:'movie'},{episodeNumbers:[7,8]},{episodeNumbers:[1,2,3]},{episodeNumbers:[7,7,9]}]) {
    const input = {...sample,...change};
    assert.equal(normalizeReleaseNumbering(input,rules),input);
  }
});
