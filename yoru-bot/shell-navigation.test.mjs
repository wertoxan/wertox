import test from 'node:test';
import assert from 'node:assert/strict';
import {mountShellNavigation} from './shell-navigation.mjs';

test('sync navigation visibility and detach shell listeners', () => {
  const calls = [];
  let active = false;
  let click;
  let refresh;
  const page = {};
  const shell = {BackButton:{
    show:()=>calls.push('show'),
    hide:()=>calls.push('hide'),
    onClick:fn=>{click=fn;},
    offClick:fn=>{assert.equal(fn,click);click=null;}
  }};
  const observe = fn => {
    refresh=fn;
    return {
      observe:target=>{assert.equal(target,page);},
      disconnect:()=>calls.push('disconnect')
    };
  };
  const cleanup = mountShellNavigation({back:()=>{active=false;},hasBack:()=>active,shell,observe,page});
  assert.deepEqual(calls,['hide']);
  active=true;
  refresh();
  refresh();
  click();
  assert.deepEqual(calls,['hide','show','hide']);
  cleanup();
  assert.deepEqual(calls,['hide','show','hide','disconnect','hide']);
  assert.equal(click,null);
});

test('a missing shell is harmless', () => {
  mountShellNavigation({})();
});
