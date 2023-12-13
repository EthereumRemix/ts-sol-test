'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWeb3 = exports.extendWeb3 = void 0;
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importStar(require("web3"));
const web3_utils_1 = require("web3-utils");
function extendWeb3(web3) {
    if (!web3.debug) {
        web3.registerPlugin(new Web3DebugPlugin());
    }
}
exports.extendWeb3 = extendWeb3;
function loadWeb3(url = 'http://localhost:8545') {
    const web3 = new web3_1.default();
    web3.setProvider(new web3_1.default.providers.HttpProvider(url));
    extendWeb3(web3);
    return web3;
}
exports.loadWeb3 = loadWeb3;
class Web3DebugPlugin extends web3_1.Web3PluginBase {
    constructor() {
        super(...arguments);
        this.pluginNamespace = 'debug';
    }
    preimage(key, cb) {
        this.requestManager.send({
            method: 'debug_preimage',
            params: [key]
        })
            .then(result => cb(null, result))
            .catch(error => cb(error));
    }
    traceTransaction(txHash, options, cb) {
        this.requestManager.send({
            method: 'debug_traceTransaction',
            params: [txHash, options]
        })
            .then(result => cb(null, result))
            .catch(error => cb(error));
    }
    storageRangeAt(txBlockHash, txIndex, address, start, maxSize, cb) {
        this.requestManager.send({
            method: 'debug_storageRangeAt',
            params: [txBlockHash, (0, web3_utils_1.toNumber)(txIndex), address, start, maxSize]
        })
            .then(result => cb(null, result))
            .catch(error => cb(error));
    }
}
//# sourceMappingURL=init.js.map