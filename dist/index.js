"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var fs = __importStar(require("fs/promises"));
var fs_1 = require("fs");
var path = __importStar(require("path"));
var cli = __importStar(require("@actions/exec"));
var ts = __importStar(require("typescript"));
var remix_solidity_1 = require("@remix-project/remix-solidity");
var remix_url_resolver_1 = require("@remix-project/remix-url-resolver");
var axios_1 = __importDefault(require("axios"));
function execute() {
    return __awaiter(this, void 0, void 0, function () {
        var testPath, contractPath, compilerVersion, isTestPathDirectory, isContractPathDirectory, compileSettings;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testPath = core.getInput('test-path');
                    contractPath = core.getInput('contract-path');
                    if (!testPath)
                        throw new Error('Test path is required');
                    if (!contractPath)
                        throw new Error('Contract path is required');
                    contractPath = path.resolve(contractPath);
                    testPath = path.resolve(testPath);
                    compilerVersion = core.getInput('compiler-version');
                    return [4 /*yield*/, fs.stat(testPath)];
                case 1:
                    isTestPathDirectory = (_a.sent()).isDirectory();
                    return [4 /*yield*/, fs.stat(contractPath)];
                case 2:
                    isContractPathDirectory = (_a.sent()).isDirectory();
                    compileSettings = {
                        optimize: true,
                        evmVersion: null,
                        runs: 200,
                        version: compilerVersion
                    };
                    // load environment and depeondencies
                    return [4 /*yield*/, core.group("Setup environment", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, setupRunEnv()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                        // compile smart contracts to run tests on.
                    ];
                case 3:
                    // load environment and depeondencies
                    _a.sent();
                    // compile smart contracts to run tests on.
                    return [4 /*yield*/, core.group("Compile contracts", function () { return __awaiter(_this, void 0, void 0, function () {
                            var contractFiles, _i, contractFiles_1, file;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!isContractPathDirectory) return [3 /*break*/, 9];
                                        return [4 /*yield*/, fs.readdir(contractPath)];
                                    case 1:
                                        contractFiles = _a.sent();
                                        if (!(contractFiles.length > 0)) return [3 /*break*/, 7];
                                        _i = 0, contractFiles_1 = contractFiles;
                                        _a.label = 2;
                                    case 2:
                                        if (!(_i < contractFiles_1.length)) return [3 /*break*/, 6];
                                        file = contractFiles_1[_i];
                                        return [4 /*yield*/, fs.stat("".concat(contractPath, "/").concat(file))];
                                    case 3:
                                        if ((_a.sent()).isDirectory())
                                            return [3 /*break*/, 5];
                                        return [4 /*yield*/, compileContract("".concat(contractPath, "/").concat(file), compileSettings)];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 6: return [3 /*break*/, 8];
                                    case 7:
                                        core.setFailed('No contract files found');
                                        _a.label = 8;
                                    case 8: return [3 /*break*/, 11];
                                    case 9: return [4 /*yield*/, compileContract(contractPath, compileSettings)];
                                    case 10:
                                        _a.sent();
                                        _a.label = 11;
                                    case 11: return [2 /*return*/];
                                }
                            });
                        }); })
                        // Move remix dependencies to test folder and transpile test files. Then run tests.
                    ];
                case 4:
                    // compile smart contracts to run tests on.
                    _a.sent();
                    // Move remix dependencies to test folder and transpile test files. Then run tests.
                    return [4 /*yield*/, core.group("Run tests", function () { return __awaiter(_this, void 0, void 0, function () {
                            var testFiles, filesPaths, _i, testFiles_1, testFile, filePath, filePath;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!isTestPathDirectory) return [3 /*break*/, 11];
                                        return [4 /*yield*/, fs.readdir(testPath)];
                                    case 1:
                                        testFiles = _a.sent();
                                        filesPaths = [];
                                        if (!(testFiles.length > 0)) return [3 /*break*/, 10];
                                        _i = 0, testFiles_1 = testFiles;
                                        _a.label = 2;
                                    case 2:
                                        if (!(_i < testFiles_1.length)) return [3 /*break*/, 8];
                                        testFile = testFiles_1[_i];
                                        return [4 /*yield*/, fs.stat("".concat(testPath, "/").concat(testFile))];
                                    case 3:
                                        if (!(_a.sent()).isDirectory()) return [3 /*break*/, 5];
                                        return [4 /*yield*/, transpileDirectory("".concat(testPath, "/").concat(testFile))];
                                    case 4:
                                        _a.sent();
                                        return [3 /*break*/, 7];
                                    case 5:
                                        if (!(testFile.endsWith('.ts') || testFile.endsWith('.js'))) return [3 /*break*/, 7];
                                        return [4 /*yield*/, main("".concat(testPath, "/").concat(testFile), contractPath)];
                                    case 6:
                                        filePath = _a.sent();
                                        if (filePath)
                                            filesPaths.push(filePath);
                                        _a.label = 7;
                                    case 7:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 8:
                                        if (!(filesPaths.length > 0)) return [3 /*break*/, 10];
                                        return [4 /*yield*/, runTest(filesPaths)];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10: return [3 /*break*/, 14];
                                    case 11: return [4 /*yield*/, main(testPath, contractPath)];
                                    case 12:
                                        filePath = _a.sent();
                                        if (!filePath) return [3 /*break*/, 14];
                                        return [4 /*yield*/, runTest(filePath)];
                                    case 13:
                                        _a.sent();
                                        _a.label = 14;
                                    case 14: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 5:
                    // Move remix dependencies to test folder and transpile test files. Then run tests.
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Compile single smart contract
function compileContract(contractPath, settings) {
    return __awaiter(this, void 0, void 0, function () {
        var contract, compilationTargets, remixCompiler, compilerList, releases, compilerUrl_1;
        var _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fs.readFile(contractPath, 'utf8')];
                case 1:
                    contract = _b.sent();
                    compilationTargets = (_a = {}, _a[contractPath] = { content: contract }, _a);
                    remixCompiler = new remix_solidity_1.Compiler(function (url, cb) { return __awaiter(_this, void 0, void 0, function () {
                        var importContent, resolver, result, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 6, , 7]);
                                    return [4 /*yield*/, (0, fs_1.existsSync)(url)];
                                case 1:
                                    if (!_a.sent()) return [3 /*break*/, 3];
                                    return [4 /*yield*/, fs.readFile(url, 'utf8')];
                                case 2:
                                    importContent = _a.sent();
                                    cb(null, importContent);
                                    return [3 /*break*/, 5];
                                case 3:
                                    resolver = new remix_url_resolver_1.RemixURLResolver();
                                    return [4 /*yield*/, resolver.resolve(url)];
                                case 4:
                                    result = _a.sent();
                                    cb(null, result.content);
                                    _a.label = 5;
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    e_1 = _a.sent();
                                    cb(e_1.message);
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, axios_1.default.get('https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/list.json')];
                case 2:
                    compilerList = _b.sent();
                    releases = compilerList.data.releases;
                    if (releases[settings.version]) {
                        compilerUrl_1 = releases[settings.version].replace('soljson-', '').replace('.js', '');
                        remixCompiler.set('evmVersion', settings.evmVersion);
                        remixCompiler.set('optimize', settings.optimize);
                        remixCompiler.set('runs', 200);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var intervalId;
                                remixCompiler.loadRemoteVersion(compilerUrl_1);
                                remixCompiler.event.register('compilerLoaded', function () {
                                    remixCompiler.compile(compilationTargets, contractPath);
                                    // use setInterval to keep gh-action process alive in other for compilation to finish
                                    process.stdout.write('\nCompiling');
                                    intervalId = setInterval(function () {
                                        process.stdout.write('.');
                                    }, 1000);
                                });
                                remixCompiler.event.register('compilationFinished', function (success, data, source) { return __awaiter(_this, void 0, void 0, function () {
                                    var contractName, artifactsPath;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!success) return [3 /*break*/, 4];
                                                contractName = path.basename(contractPath, '.sol');
                                                artifactsPath = "".concat(path.dirname(contractPath), "/build-artifacts");
                                                if (!!(0, fs_1.existsSync)(artifactsPath)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, fs.mkdir(artifactsPath)];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2: return [4 /*yield*/, fs.writeFile("".concat(artifactsPath, "/").concat(contractName, ".json"), JSON.stringify(data, null, 2))];
                                            case 3:
                                                _a.sent();
                                                clearInterval(intervalId);
                                                return [2 /*return*/, resolve()];
                                            case 4:
                                                clearInterval(intervalId);
                                                return [2 /*return*/, reject('Compilation failed')];
                                        }
                                    });
                                }); });
                            })];
                    }
                    else {
                        throw new Error('Compiler version not found');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Transpile and execute test files
function main(filePath, contractPath) {
    return __awaiter(this, void 0, void 0, function () {
        var testFileContent, hardhatEthersImportRegex, hardhatEthersRequireRegex, chaiImportRegex, chaiRequireRegex, hardhatImportIndex, hardhatRequireIndex, chaiImportIndex, chaiRequireIndex, describeIndex, testFile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fs.readFile(filePath, 'utf8')];
                case 1:
                    testFileContent = _a.sent();
                    hardhatEthersImportRegex = /from\s*['"]hardhat['"]|from\s*['"]hardhat\/ethers['"]|from\s*['"]ethers['"]|from\s*['"]ethers\/ethers['"]/g;
                    hardhatEthersRequireRegex = /require\(['"]hardhat\/ethers['"]\)|require\(['"]hardhat['"]\)|require\(['"]ethers\/ethers['"]\)|require\(['"]ethers['"]\)/g;
                    chaiImportRegex = /from\s*['"]chai['"]/g;
                    chaiRequireRegex = /require\(['"]chai['"]\)/g;
                    hardhatImportIndex = testFileContent.search(hardhatEthersImportRegex);
                    hardhatRequireIndex = testFileContent.search(hardhatEthersRequireRegex);
                    chaiImportIndex = testFileContent.search(chaiImportRegex);
                    chaiRequireIndex = testFileContent.search(chaiRequireRegex);
                    describeIndex = testFileContent.search(/describe\s*\(/);
                    if (!(describeIndex === -1)) return [3 /*break*/, 2];
                    throw new Error("No describe function found in ".concat(filePath, ". Please wrap your tests in a describe function."));
                case 2:
                    testFileContent = "".concat(testFileContent.slice(0, describeIndex), "\nglobal.remixContractArtifactsPath = \"").concat(contractPath, "/build-artifacts\"; \n").concat(testFileContent.slice(describeIndex));
                    if (hardhatImportIndex > -1)
                        testFileContent = testFileContent.replace(hardhatEthersImportRegex, 'from \'sol-test-helper\'');
                    if (hardhatRequireIndex > -1)
                        testFileContent = testFileContent.replace(hardhatEthersRequireRegex, 'require(\'sol-test-helper\')');
                    if (chaiImportIndex)
                        testFileContent = testFileContent.replace(chaiImportRegex, 'from \'sol-test-helper\'');
                    if (chaiRequireIndex)
                        testFileContent = testFileContent.replace(chaiRequireRegex, 'require(\'sol-test-helper\')');
                    if (!filePath.endsWith('.ts')) return [3 /*break*/, 4];
                    testFile = transpileScript(testFileContent);
                    console.log('testFile: ', testFile);
                    filePath = filePath.replace('.ts', '.js');
                    return [4 /*yield*/, fs.writeFile(filePath, testFile.outputText)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, filePath];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Setup environment for running tests
function setupRunEnv() {
    return __awaiter(this, void 0, void 0, function () {
        var workingDirectory, yarnLock, isYarnRepo, packageLock, isNPMrepo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workingDirectory = process.cwd();
                    yarnLock = path.join(workingDirectory, 'yarn.lock');
                    return [4 /*yield*/, (0, fs_1.existsSync)(yarnLock)];
                case 1:
                    isYarnRepo = _a.sent();
                    packageLock = path.join(workingDirectory, 'package-lock.json');
                    isNPMrepo = (0, fs_1.existsSync)(packageLock);
                    if (!isYarnRepo) return [3 /*break*/, 3];
                    return [4 /*yield*/, cli.exec('yarn', ['add', 'mocha', 'sol-test-helper', '--dev'])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 3:
                    if (!isNPMrepo) return [3 /*break*/, 5];
                    return [4 /*yield*/, cli.exec('npm', ['install', 'mocha', 'sol-test-helper', '--save-dev'])];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, cli.exec('npm', ['init', '-y'])];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, cli.exec('npm', ['install', 'mocha', 'sol-test-helper', '--save-dev'])];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Run tests
function runTest(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Array.isArray(filePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, cli.exec('npx', __spreadArray(__spreadArray(['mocha'], filePath, true), ['--timeout', '60000'], false))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, cli.exec('npx', ['mocha', filePath, '--timeout', '60000'])];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Transpile test scripts
function transpileScript(script) {
    var output = ts.transpileModule(script, { compilerOptions: {
            target: ts.ScriptTarget.ES2015,
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
        } });
    return output;
}
// Transpile directories
function transpileDirectory(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, files_1, file, filePath, stat, testFileContent, testFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readdir(dir)];
                case 1:
                    files = _a.sent();
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 9];
                    file = files_1[_i];
                    filePath = path.join(dir, file);
                    return [4 /*yield*/, fs.stat(filePath)];
                case 3:
                    stat = _a.sent();
                    if (!stat.isDirectory()) return [3 /*break*/, 5];
                    return [4 /*yield*/, transpileDirectory(filePath)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 5:
                    if (!file.endsWith('.ts')) return [3 /*break*/, 8];
                    return [4 /*yield*/, fs.readFile(filePath, 'utf8')];
                case 6:
                    testFileContent = _a.sent();
                    testFile = transpileScript(testFileContent);
                    return [4 /*yield*/, fs.writeFile(filePath.replace('.ts', '.js'), testFile.outputText)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9: return [2 /*return*/];
            }
        });
    });
}
execute().catch(function (error) {
    if (typeof (error) !== 'string') {
        if (error.message)
            error = error.message;
        else {
            try {
                error = 'error: ' + JSON.stringify(error);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    core.setFailed(error);
});
