/**
 * Tests for build_run_sim_quiet plugin
 */

import { describe, it, expect } from 'vitest';
import buildRunSimQuiet from '../build_run_sim_quiet.ts';

describe('build_run_sim_quiet plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildRunSimQuiet.name).toBe('build_run_sim_quiet');
    });

    it('should have correct description', () => {
      expect(buildRunSimQuiet.description).toBe(
        'Builds and runs an app on an iOS simulator (xcbeautify -q).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildRunSimQuiet.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildRunSimQuiet.schema).toBeDefined();
    });
  });
});
