/**
 * Tests for build_sim_quiet plugin
 */

import { describe, it, expect } from 'vitest';
import buildSimQuiet from '../build_sim_quiet.ts';

describe('build_sim_quiet plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildSimQuiet.name).toBe('build_sim_quiet');
    });

    it('should have correct description', () => {
      expect(buildSimQuiet.description).toBe(
        'Builds an app for an iOS simulator (xcbeautify -q).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildSimQuiet.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildSimQuiet.schema).toBeDefined();
    });
  });
});
