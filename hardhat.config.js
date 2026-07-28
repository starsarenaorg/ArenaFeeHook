const { subtask } = require("hardhat/config");
const {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD
} = require("hardhat/builtin-tasks/task-names");

const SOLC_VERSION = "0.8.30";
const SOLC_LONG_VERSION = "0.8.30+commit.73712a01";

// Use the dependency-pinned local solc-js build so compilation does not depend
// on downloading a compiler binary at build time.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, _hre, runSuper) => {
  if (args.solcVersion === SOLC_VERSION) {
    return {
      compilerPath: require.resolve("solc/soljson.js"),
      isSolcJs: true,
      version: SOLC_VERSION,
      longVersion: SOLC_LONG_VERSION
    };
  }

  return runSuper();
});

module.exports = {
  solidity: {
    version: SOLC_VERSION,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: false,
      evmVersion: "cancun"
    }
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
