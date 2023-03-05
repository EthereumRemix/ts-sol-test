import * as core from'@actions/core'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import * as path from 'path'
import * as cli from '@actions/exec'
import * as ts from 'typescript'
import { Compiler as RemixCompiler, EVMVersion } from '@remix-project/remix-solidity'
import { RemixURLResolver } from '@remix-project/remix-url-resolver'
import axios from 'axios'

interface CompileSettings {
  optimize: boolean,
  evmVersion: EVMVersion | null,
  runs: number,
  version: string
}

async function execute () {
  let testPath = core.getInput('test-path')
  let contractPath = core.getInput('contract-path')

  if (!testPath) throw new Error('Test path is required')
  if (!contractPath) throw new Error('Contract path is required')
  contractPath = path.resolve(contractPath)
  testPath = path.resolve(testPath)
  const compilerVersion = core.getInput('compiler-version')
  const evmVersion = core.getInput('evm-version') as EVMVersion
  const runs = core.getInput('optimizer-runs')
  const optimize = core.getBooleanInput('optimize')
  const hardFork = core.getInput('hard-fork')
  const nodeUrl = core.getInput('node-url')
  const blockNumber = core.getInput('block-number')

  const providerConfig = { 
    nodeUrl,
    blockNumber: isNaN(parseInt(blockNumber)) ? 'latest' : parseInt(blockNumber),
    hardFork
  }

  const isTestPathDirectory = (await fs.stat(testPath)).isDirectory()
  const isContractPathDirectory = (await fs.stat(contractPath)).isDirectory()
  const compileSettings = {
    optimize: optimize || false,
    evmVersion: evmVersion || null,
    runs: parseInt(runs),
    version: compilerVersion || '0.8.4'
  }

  // load environment and depeondencies
  await core.group("Setup environment", async () => {
    await setupRunEnv()
  })

  // compile smart contracts to run tests on.
  await core.group("Compile contracts", async () => {
    if (isContractPathDirectory) {
      const contractFiles = await fs.readdir(contractPath)

      if (contractFiles.length > 0)  {
        for (const file of contractFiles) {
          if ((await fs.stat(`${contractPath}/${file}`)).isDirectory()) continue

          await compileContract(`${contractPath}/${file}`, compileSettings)
        }
      } else {
        core.setFailed('No contract files found')
      }
    } else {
      await compileContract(contractPath, compileSettings)
    }
  })

  // Move remix dependencies to test folder and transpile test files. Then run tests.
  await core.group("Run tests", async () => {
    if (isTestPathDirectory) {
      const testFiles = await fs.readdir(testPath)
      const filesPaths = []

      if (testFiles.length > 0) {
        for (const testFile of testFiles) {
          // transpile dependencies
          if ((await fs.stat(`${testPath}/${testFile}`)).isDirectory()) await transpileDirectory(`${testPath}/${testFile}`)
          else {
            if (testFile.endsWith('.ts') || testFile.endsWith('.js')) {
              const filePath = await main(`${testPath}/${testFile}`, contractPath, providerConfig)

              if (filePath) filesPaths.push(filePath)
            }
          }
        }
        if (filesPaths.length > 0) {
          await runTest(filesPaths)
        }
      }
    } else {
      const filePath = await main(testPath, contractPath, providerConfig)

      if (filePath) {
        const parentPath = testPath.split('/').slice(0, -1).join('/')
        const folderFiles = await fs.readdir(parentPath)
  
        if (folderFiles.length > 0) {
          for (const file of folderFiles) {
            if ((await fs.stat(`${parentPath}/${file}`)).isDirectory()) await transpileDirectory(`${parentPath}/${file}`)
            else if (file.endsWith('.ts') && (testPath !== `${parentPath}/${file}`)) {
              let depPath = `${parentPath}/${file}`
              const testFileContent = await fs.readFile(depPath, 'utf8')
              const testFile = transpileScript(testFileContent)
  
              depPath = depPath.replace('.ts', '.js')
              await fs.writeFile(depPath, testFile.outputText)
            }
          }
        }
        await runTest(filePath)
      }
    }
  })
}

// Compile single smart contract
async function compileContract (contractPath: string, settings: CompileSettings): Promise<void> {
  const contract = await fs.readFile(contractPath, 'utf8')
  const compilationTargets = { [contractPath]: { content: contract } }
  const remixCompiler = new RemixCompiler(async (url: string, cb: (error: string | null, result?: string) => void) => {
    try {
      if(await existsSync(url)) {
        const importContent = await fs.readFile(url, 'utf8')

        cb(null, importContent)
      } else {
        const resolver = new RemixURLResolver()
        const result = await resolver.resolve(url)

        cb(null, result.content)
      }
    } catch (e: any) {
      cb(e.message)
    }
  })
  const compilerList = await axios.get('https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/list.json')
  const releases = compilerList.data.releases

  if (releases[settings.version]) {
    const compilerUrl = releases[settings.version].replace('soljson-', '').replace('.js', '')

    remixCompiler.set('evmVersion', settings.evmVersion)
    remixCompiler.set('optimize', settings.optimize)
    remixCompiler.set('runs', 200)
    return new Promise((resolve, reject) => {
      let intervalId: NodeJS.Timer

      remixCompiler.loadRemoteVersion(compilerUrl)
      remixCompiler.event.register('compilerLoaded', () => {
        remixCompiler.compile(compilationTargets, contractPath)
        // use setInterval to keep gh-action process alive in other for compilation to finish
        process.stdout.write('\nCompiling ')
        intervalId = setInterval(() => {
          process.stdout.write('.')
        }, 1000)
      })
      remixCompiler.event.register('compilationFinished', async (success: boolean, data: any, source: string) => {
        if (success) {
          const contractName = path.basename(contractPath, '.sol')
          let artifactsPath = ''

          console.log('contractPath: ', contractPath)
          if (contractPath.endsWith('.sol')) {
            const split = contractPath.split('/')

            artifactsPath = `${split.slice(0, split.length - 1).join('/')}/build-artifacts`
          } else {
            artifactsPath = `${path.dirname(contractPath)}/build-artifacts`
          }
          if (!existsSync(artifactsPath)) await fs.mkdir(artifactsPath)
          await fs.writeFile(`${artifactsPath}/${contractName}.json`, JSON.stringify(data, null, 2))
          clearInterval(intervalId)
          return resolve()
        } else {
          clearInterval(intervalId)
          throw new Error('Compilation failed')
        }
      })
    })
  } else {
    throw new Error('Compiler version not found')
  }
}

// Transpile and execute test files
async function main (filePath: string, contractPath: string, providerConfig: { hardFork: string, nodeUrl: string, blockNumber: number | string }): Promise<string | undefined> {
  try {
    // TODO: replace regex globally
    let testFileContent = await fs.readFile(filePath, 'utf8')
    const hardhatEthersImportRegex = /from\s*['"]hardhat['"]|from\s*['"]hardhat\/ethers['"]|from\s*['"]ethers['"]|from\s*['"]ethers\/ethers['"]/g
    const hardhatEthersRequireRegex = /require\(['"]hardhat\/ethers['"]\)|require\(['"]hardhat['"]\)|require\(['"]ethers\/ethers['"]\)|require\(['"]ethers['"]\)/g
    const chaiImportRegex = /from\s*['"]chai['"]/g
    const chaiRequireRegex = /require\(['"]chai['"]\)/g
    const hardhatImportIndex = testFileContent.search(hardhatEthersImportRegex)
    const hardhatRequireIndex = testFileContent.search(hardhatEthersRequireRegex)
    const chaiImportIndex = testFileContent.search(chaiImportRegex)
    const chaiRequireIndex = testFileContent.search(chaiRequireRegex)
    
    testFileContent = `global.remixContractArtifactsPath = "${contractPath}/build-artifacts";\nglobal.fork = "${providerConfig.hardFork}";\nglobal.nodeUrl = "${providerConfig.nodeUrl}";\nglobal.blockNumber = "${providerConfig.blockNumber}";\n${testFileContent}`
    if (hardhatImportIndex > -1) testFileContent = testFileContent.replace(hardhatEthersImportRegex, 'from \'@remix-project/ghaction-helper\'')
    if (hardhatRequireIndex > -1) testFileContent = testFileContent.replace(hardhatEthersRequireRegex, 'require(\'@remix-project/ghaction-helper\')')
    if (chaiImportIndex) testFileContent = testFileContent.replace(chaiImportRegex, 'from \'@remix-project/ghaction-helper\'')
    if (chaiRequireIndex) testFileContent = testFileContent.replace(chaiRequireRegex, 'require(\'@remix-project/ghaction-helper\')')
    if (filePath.endsWith('.ts')) {
      const testFile = transpileScript(testFileContent)

      filePath = filePath.replace('.ts', '.js')
      await fs.writeFile(filePath, testFile.outputText)
      return filePath
    } else if (filePath.endsWith('.js')) {
      await fs.writeFile(filePath, testFileContent)
      return filePath
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

// Setup environment for running tests
async function setupRunEnv (): Promise<void> {
  const workingDirectory = process.cwd()
  const yarnLock = path.join(workingDirectory, 'yarn.lock')
  const isYarnRepo = await existsSync(yarnLock)
  const packageLock = path.join(workingDirectory, 'package-lock.json')
  const isNPMrepo = existsSync(packageLock)

  if (isYarnRepo) {
    await cli.exec('yarn', ['add', 'tslib', 'mocha', '@remix-project/ghaction-helper@0.1.7-alpha.5', '--dev'])
  } else if (isNPMrepo) {
    await cli.exec('npm', ['install', 'tslib', 'mocha', '@remix-project/ghaction-helper@0.1.7-alpha.5', '--save-dev'])
  } else {
    await cli.exec('npm', ['init', '-y'])
    await cli.exec('npm', ['install', 'tslib', 'mocha', '@remix-project/ghaction-helper@0.1.7-alpha.5', '--save-dev'])
  }
}

// Run tests
async function runTest (filePath: string | string[]): Promise<void> {
  if (Array.isArray(filePath)) {
      await cli.exec('npx', ['mocha', ...filePath, '--timeout', '15000'])
  } else {
      await cli.exec('npx', ['mocha', filePath, '--timeout', '15000'])
  }
}

// Transpile test scripts
function transpileScript (script: string): ts.TranspileOutput {
  const output = ts.transpileModule(script, { compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,  
  }})

  return output
}

// Transpile directories
async function transpileDirectory (dir: string): Promise<void> {
  const files = await fs.readdir(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = await fs.stat(filePath)

    if (stat.isDirectory()) {
      await transpileDirectory(filePath)
    } else if (file.endsWith('.ts')) {
      const testFileContent = await fs.readFile(filePath, 'utf8')
      const testFile = transpileScript(testFileContent)

      await fs.writeFile(filePath.replace('.ts', '.js'), testFile.outputText)
    }
  }
}

execute().catch(error => {
  if (typeof (error) !== 'string') {
    if (error.message) error = error.message
    else {
      try { error = 'error: ' + JSON.stringify(error) } catch (e) { console.log(e) }
    }
  }
  core.setFailed(error)
})
