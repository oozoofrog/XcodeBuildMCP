/**
 * Tests for build_run_sim_error plugin
 */

import { describe, it, expect } from 'vitest';
import buildRunSimError from '../build_run_sim_error.ts';

describe('build_run_sim_error plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildRunSimError.name).toBe('build_run_sim_error');
    });

    it('should have correct description', () => {
      expect(buildRunSimError.description).toBe(
        'Builds and runs an app on an iOS simulator (xcbeautify -qq, errors only).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildRunSimError.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildRunSimError.schema).toBeDefined();
    });
  });
});
