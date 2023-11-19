import projectHandler from './project';
import moduleHandler from './module';

/**
 * Public function `analyse`.
 *
 * Returns an object detailing the complexity of abstract syntax tree(s).
 *
 * @param ast {object|array}  The abstract syntax tree(s) to analyse for
 *                            code complexity.
 * @param walker {object}     The AST walker to use against `ast`.
 * @param [options] {object}  Options to modify the complexity calculation.
 *
 */

export function analyse(ast, walker, options) {
  if (Array.isArray(ast)) {
    return projectHandler.analyse(ast, walker, options)
  }
  return moduleHandler.analyse(ast, walker, options)
}

/**
 * Public function `processResults`.
 *
 * Given an object with an array of results, it returns results with calculated aggregate values.
 *
 * @param report {object}  The report object with an array of results for calculating aggregates.
 * @param noCoreSize {boolean} Don't compute coresize or the visibility matrix.
 *
 */
export function processResults (report, noCoreSize) {
  return projectHandler.processResults(report, noCoreSize)
}
