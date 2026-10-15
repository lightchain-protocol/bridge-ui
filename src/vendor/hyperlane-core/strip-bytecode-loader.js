// Webpack loader for @hyperlane-xyz/core typechain factories (see next.config.js).
//
// Every `*__factory.js` embeds the contract's deploy bytecode as a hex string, which is most of
// the file. The UI only ever calls deployed contracts (it needs the ABI, never the bytecode), but
// the Hyperlane SDK keeps all ~300 factories reachable through lookup maps, so tree-shaking cannot
// drop them. Blanking the bytecode keeps the modules valid and removes the dead weight.
const BYTECODE = /^const _bytecode\s*=\s*"0x[0-9a-fA-F]*";?$/m;

module.exports = function stripBytecode(source) {
  return source.replace(BYTECODE, 'const _bytecode = "0x";');
};
