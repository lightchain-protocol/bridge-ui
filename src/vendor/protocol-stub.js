// Stand-in for the non-EVM chain SDKs and wallet libraries (Solana, Cosmos, Starknet, Radix,
// Aleo, Tron, zkSync). See next.config.js: imports of those packages resolve here instead.
//
// The Hyperlane SDK and widgets import all of them statically, so they cannot be tree-shaken,
// and together they were ~15 MB of a bundle for a bridge that only ever touches two EVM chains.
//
// Everything exported is inert: any property is another inert value, and calling or
// constructing one returns an inert value too. Inert rather than throwing, because a few SDK
// modules build constants from these packages at import time (e.g. `new PublicKey(...)`), and a
// throw there would take the whole app down. Non-EVM code paths are unreachable in this build:
// only EVM chains are configured, so the SDK never instantiates a non-EVM adapter or provider.
//
// CommonJS on purpose: named ESM imports from a CommonJS module are looked up at runtime, so the
// Proxy can answer for any export name without webpack "export not found" warnings.
const PRIMITIVE_METHODS = {
  toString: () => '[non-EVM stub]',
  valueOf: () => undefined,
  toJSON: () => undefined,
};

function inert() {
  // A function target so the value can be called, `new`-ed and `extends`-ed.
  const target = function () {};
  return new Proxy(target, {
    get(t, prop) {
      if (prop === '__esModule') return false;
      if (prop === 'then') return undefined; // not a thenable
      if (prop === 'prototype') return t.prototype;
      if (typeof prop === 'symbol') return undefined;
      if (prop in PRIMITIVE_METHODS) return PRIMITIVE_METHODS[prop];
      return inert();
    },
    apply: () => inert(),
    construct: () => inert(),
  });
}

module.exports = inert();
