/**
 * Tests for build_macos_error plugin
 */

import { describe, it, expect } from 'vitest';
import buildMacOSError from '../build_macos_error.ts';

describe('build_macos_error plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildMacOSError.name).toBe('build_macos_error');
    });

    it('should have correct description', () => {
      expect(buildMacOSError.description).toBe('Builds a macOS app (xcbeautify -qq, errors only).');
    });

    it('should have handler function', () => {
      expect(typeof buildMacOSError.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildMacOSError.schema).toBeDefined();
    });
  });
});
