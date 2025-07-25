
/**
 * Utility functions for Weave framework internal operations
 *
 * Provides common utilities for:
 * - Options processing and default merging
 * - Error restoration from serialized format
 * - Handler wrapping for middleware integration
 *
 * These utilities are used internally by the framework and are not part
 * of the public API. They handle low-level operations like configuration
 * processing, error handling, and function composition.
 *
 * @namespace Utils
 */

exports = {
  ...require('./options'),
  ...require('./restoreError'),
  ...require('./wrap-handler')
};
