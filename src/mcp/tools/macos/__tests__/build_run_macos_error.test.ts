/**
 * Tests for build_run_macos_error plugin
 */

import { describe, it, expect } from 'vitest';
import buildRunMacOSError from '../build_run_macos_error.ts';

describe('build_run_macos_error plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildRunMacOSError.name).toBe('build_run_macos_error');
    });

    it('should have correct description', () => {
      expect(buildRunMacOSError.description).toBe(
        'Builds and runs a macOS app (xcbeautify -qq, errors only).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildRunMacOSError.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildRunMacOSError.schema).toBeDefined();
    });
  });
});
