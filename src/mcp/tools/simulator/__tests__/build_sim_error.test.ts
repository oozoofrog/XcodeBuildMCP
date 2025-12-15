/**
 * Tests for build_sim_error plugin
 */

import { describe, it, expect } from 'vitest';
import buildSimError from '../build_sim_error.ts';

describe('build_sim_error plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildSimError.name).toBe('build_sim_error');
    });

    it('should have correct description', () => {
      expect(buildSimError.description).toBe(
        'Builds an app for an iOS simulator (xcbeautify -qq, errors only).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildSimError.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildSimError.schema).toBeDefined();
    });
  });
});
