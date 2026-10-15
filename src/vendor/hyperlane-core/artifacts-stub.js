// Replaces @hyperlane-xyz/core/dist/zksync/artifacts.js in the browser bundle (see next.config.js).
// The real module imports ~300 zkSync compiler artifacts (14 MB) that only contract deployment
// needs; the UI never deploys. Plain JS: the replaced module keeps its .js path, so no TS loader runs.
export const zkSyncContractArtifacts = [];
