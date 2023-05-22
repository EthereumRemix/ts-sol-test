'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const compiler_utils_1 = require("./compiler-utils");
const compiler_abstract_1 = require("./compiler-abstract");
const compiler_1 = require("./compiler");
const compile = (compilationTargets, settings, contentResolverCallback) => {
    return new Promise((resolve, reject) => {
        const compiler = new compiler_1.Compiler(contentResolverCallback);
        compiler.set('evmVersion', settings.evmVersion);
        compiler.set('optimize', settings.optimize);
        compiler.set('language', settings.language);
        compiler.set('runs', settings.runs);
        compiler.loadVersion((0, compiler_utils_1.canUseWorker)(settings.version), (0, compiler_utils_1.urlFromVersion)(settings.version));
        compiler.event.register('compilationFinished', (success, compilationData, source, input, version) => {
            resolve(new compiler_abstract_1.CompilerAbstract(settings.version, compilationData, source, input));
        });
        compiler.event.register('compilerLoaded', _ => compiler.compile(compilationTargets, ''));
    });
};
exports.compile = compile;
//# sourceMappingURL=compiler-helpers.js.map