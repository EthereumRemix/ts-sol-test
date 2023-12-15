## Action For Running JS and TS Unit Tests on Solidity Contracts
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ethereum/remix-project/issues)

This GitHub action enables you to run JS and TS unit tests on solidity smart contracts as part of your continuous integration and deployment process. 
To know more about Remix IDE `Solidity Unit Testing`, visit [Remix IDE official documentation](https://remix-ide.readthedocs.io/en/latest/unittesting.html), [Remix Tests Library](https://github.com/ethereum/remix-project/blob/master/libs/remix-tests/README.md).

### Example workflow: Sample
```
name: sol-test-js
on: [push]

jobs:
  run_sample_test_job:
    runs-on: ubuntu-latest
    name: A job to run solidity tests in js
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run Default Test
        env:
          NODE_OPTIONS: "--max_old_space_size=4096"
        uses: EthereumRemix/ts-sol-test@v1.4.0
        with:
          test-path: 'sample/tests'
          contract-path: 'sample/contracts'
          compiler-version: '0.8.7'
      - name: Run Custom Fork Test
        uses: EthereumRemix/ts-sol-test@v1.4.0
        with:
          test-path: 'sample/tests/custom/hardFork.test.ts'
          contract-path: 'sample/contracts/custom/mainnet_ens.sol'
          compiler-version: '0.8.17'
          hard-fork: 'merge'
          node-url: 'https://rpc.archivenode.io/e50zmkroshle2e2e50zm0044i7ao04ym'
```


### License
MIT © 2018-23 Remix Team
