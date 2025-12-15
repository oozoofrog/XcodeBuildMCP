/**
 * Tests for build_device_quiet plugin
 */

import { describe, it, expect } from 'vitest';
import buildDeviceQuiet from '../build_device_quiet.ts';

describe('build_device_quiet plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildDeviceQuiet.name).toBe('build_device_quiet');
    });

    it('should have correct description', () => {
      expect(buildDeviceQuiet.description).toBe(
        'Builds an app for a connected device (xcbeautify -q).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildDeviceQuiet.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildDeviceQuiet.schema).toBeDefined();
    });
  });
});
