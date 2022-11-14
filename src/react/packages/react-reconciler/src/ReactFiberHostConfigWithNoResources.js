/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

// Renderers that don't support hydration
// can re-export everything from this module.

function shim(...args) {
  throw new Error('The current renderer does not support Resources. ' + 'This error is likely caused by a bug in React. ' + 'Please file an issue.');
}

// Resources (when unsupported)
export const supportsResources = false;
export const isHostResourceType = shim;
export const getResource = shim;
export const acquireResource = shim;
export const releaseResource = shim;