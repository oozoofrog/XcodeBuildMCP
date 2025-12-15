/**
 * Tests for build_macos_quiet plugin
 */

import { describe, it, expect } from 'vitest';
import buildMacOSQuiet from '../build_macos_quiet.ts';

describe('build_macos_quiet plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildMacOSQuiet.name).toBe('build_macos_quiet');
    });

    it('should have correct description', () => {
      expect(buildMacOSQuiet.description).toBe('Builds a macOS app (xcbeautify -q).');
    });

    it('should have handler function', () => {
      expect(typeof buildMacOSQuiet.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildMacOSQuiet.schema).toBeDefined();
    });
  });
});
