/**
 * Tests for build_device_error plugin
 */

import { describe, it, expect } from 'vitest';
import buildDeviceError from '../build_device_error.ts';

describe('build_device_error plugin', () => {
  describe('Export Field Validation', () => {
    it('should have correct name', () => {
      expect(buildDeviceError.name).toBe('build_device_error');
    });

    it('should have correct description', () => {
      expect(buildDeviceError.description).toBe(
        'Builds an app for a connected device (xcbeautify -qq, errors only).',
      );
    });

    it('should have handler function', () => {
      expect(typeof buildDeviceError.handler).toBe('function');
    });

    it('should have schema defined', () => {
      expect(buildDeviceError.schema).toBeDefined();
    });
  });
});
