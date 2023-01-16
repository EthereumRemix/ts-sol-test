## Action For Running JS and TS Unit Tests on Solidity Contracts
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ethereum/remix-project/issues)

This GitHub action enables you to run JS and TS unit tests on solidity smart contracts as part of your continuous integration and deployment process. 
To know more about Remix IDE `Solidity Unit Testing`, visit [Remix IDE official documentation](https://remix-ide.readthedocs.io/en/latest/unittesting.html), [Remix Tests Library](https://github.com/ethereum/remix-project/blob/master/libs/remix-tests/README.md).

### Example workflow: Sample
```
  name: ts-sol-test
  on: [push]

  jobs:
  run_sample_test_job:
      runs-on: ubuntu-latest
      name: A job to run mocha and chai tests for solidity on github actions CI
      steps:
      - name: Checkout
          uses: actions/checkout@v2
      - name: Run SUT Action
          uses: EthereumRemix/ts-sol-test@v1.1
          with:
          test-path: 'sample/tests'
          contract-path: 'sample/contracts'
          compiler-version: '0.8.7'
```


### License
MIT © 2018-23 Remix Team