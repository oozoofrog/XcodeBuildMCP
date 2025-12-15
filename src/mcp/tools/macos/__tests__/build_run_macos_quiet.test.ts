/**
 * Tests for build_run_macos_quiet plugin
 */

import { describe, it, expect } from 'vitest';
import buildRunMacOSQuiet from '../build_run_macos_quiet.ts';

describe('build_run_macos_quiet plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildRunMacOSQuiet.name).toBe('build_run_macos_quiet');
    });

    it('should have correct description', () => {
      expect(buildRunMacOSQuiet.description).toBe(
        'Builds and runs a macOS app (xcbeautify -q).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildRunMacOSQuiet.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildRunMacOSQuiet.schema).toBeDefined();
    });
  });
});
