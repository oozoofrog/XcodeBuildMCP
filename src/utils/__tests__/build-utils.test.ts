/**
 * Tests for build-utils Sentry classification logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockExecutor } from '../../test-utils/mock-executors.ts';
import {
  executeXcodeBuildCommand,
  getXcbeautifyArgs,
  getXcbeautifyInstallPrompt,
  isXcbeautifyAvailable,
  resetXcbeautifyCache,
} from '../build-utils.ts';
import { XcodePlatform } from '../xcode.ts';

describe('build-utils Sentry Classification', () => {
  const mockPlatformOptions = {
    platform: XcodePlatform.macOS,
    logPrefix: 'Test Build',
  };

  const mockParams = {
    scheme: 'TestScheme',
    configuration: 'Debug',
    projectPath: '/path/to/project.xcodeproj',
  };

  describe('Exit Code 64 Classification (MCP Error)', () => {
    it('should trigger Sentry logging for exit code 64 (invalid arguments)', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'xcodebuild: error: invalid option',
        exitCode: 64,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ [stderr] xcodebuild: error: invalid option');
      expect(result.content[1].text).toContain('❌ Test Build build failed for scheme TestScheme');
    });
  });

  describe('Other Exit Codes Classification (User Error)', () => {
    it('should not trigger Sentry logging for exit code 65 (user error)', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'Scheme TestScheme was not found',
        exitCode: 65,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ [stderr] Scheme TestScheme was not found');
      expect(result.content[1].text).toContain('❌ Test Build build failed for scheme TestScheme');
    });

    it('should not trigger Sentry logging for exit code 66 (file not found)', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'project.xcodeproj cannot be opened',
        exitCode: 66,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ [stderr] project.xcodeproj cannot be opened');
    });

    it('should not trigger Sentry logging for exit code 70 (destination error)', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'Unable to find a destination matching the provided destination specifier',
        exitCode: 70,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ [stderr] Unable to find a destination matching');
    });

    it('should not trigger Sentry logging for exit code 1 (general build failure)', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'Build failed with errors',
        exitCode: 1,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ [stderr] Build failed with errors');
    });
  });

  describe('Spawn Error Classification (Environment Error)', () => {
    it('should not trigger Sentry logging for ENOENT spawn error', async () => {
      const spawnError = new Error('spawn xcodebuild ENOENT') as NodeJS.ErrnoException;
      spawnError.code = 'ENOENT';

      const mockExecutor = createMockExecutor({
        success: false,
        error: '',
        shouldThrow: spawnError,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain(
        'Error during Test Build build: spawn xcodebuild ENOENT',
      );
    });

    it('should not trigger Sentry logging for EACCES spawn error', async () => {
      const spawnError = new Error('spawn xcodebuild EACCES') as NodeJS.ErrnoException;
      spawnError.code = 'EACCES';

      const mockExecutor = createMockExecutor({
        success: false,
        error: '',
        shouldThrow: spawnError,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain(
        'Error during Test Build build: spawn xcodebuild EACCES',
      );
    });

    it('should not trigger Sentry logging for EPERM spawn error', async () => {
      const spawnError = new Error('spawn xcodebuild EPERM') as NodeJS.ErrnoException;
      spawnError.code = 'EPERM';

      const mockExecutor = createMockExecutor({
        success: false,
        error: '',
        shouldThrow: spawnError,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain(
        'Error during Test Build build: spawn xcodebuild EPERM',
      );
    });

    it('should trigger Sentry logging for non-spawn exceptions', async () => {
      const otherError = new Error('Unexpected internal error');

      const mockExecutor = createMockExecutor({
        success: false,
        error: '',
        shouldThrow: otherError,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain(
        'Error during Test Build build: Unexpected internal error',
      );
    });
  });

  describe('Success Case (No Sentry Logging)', () => {
    it('should not trigger any error logging for successful builds', async () => {
      const mockExecutor = createMockExecutor({
        success: true,
        output: 'BUILD SUCCEEDED',
        exitCode: 0,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain(
        '✅ Test Build build succeeded for scheme TestScheme',
      );
    });
  });

  describe('Exit Code Undefined Cases', () => {
    it('should not trigger Sentry logging when exitCode is undefined', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'Some error without exit code',
        exitCode: undefined,
      });

      const result = await executeXcodeBuildCommand(
        mockParams,
        mockPlatformOptions,
        false,
        'build',
        mockExecutor,
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ [stderr] Some error without exit code');
    });
  });
});

describe('xcbeautify utilities', () => {
  describe('getXcbeautifyArgs', () => {
    it('should return ["xcbeautify"] for quietLevel 0', () => {
      expect(getXcbeautifyArgs(0)).toEqual(['xcbeautify']);
    });

    it('should return ["xcbeautify", "-q"] for quietLevel 1', () => {
      expect(getXcbeautifyArgs(1)).toEqual(['xcbeautify', '-q']);
    });

    it('should return ["xcbeautify", "-qq"] for quietLevel 2', () => {
      expect(getXcbeautifyArgs(2)).toEqual(['xcbeautify', '-qq']);
    });
  });

  describe('getXcbeautifyInstallPrompt', () => {
    it('should return installation prompt containing xcbeautify', () => {
      const prompt = getXcbeautifyInstallPrompt();
      expect(prompt).toContain('xcbeautify');
    });

    it('should include brew install command', () => {
      const prompt = getXcbeautifyInstallPrompt();
      expect(prompt).toContain('brew install xcbeautify');
    });

    it('should include GitHub URL', () => {
      const prompt = getXcbeautifyInstallPrompt();
      expect(prompt).toContain('https://github.com/cpisciotta/xcbeautify');
    });
  });

  describe('isXcbeautifyAvailable', () => {
    beforeEach(() => {
      resetXcbeautifyCache();
    });

    it('should return true when xcbeautify command succeeds', async () => {
      const mockExecutor = createMockExecutor({
        success: true,
        output: '',
      });

      const result = await isXcbeautifyAvailable(mockExecutor);
      expect(result).toBe(true);
    });

    it('should return false when xcbeautify command fails', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        error: 'command not found',
      });

      const result = await isXcbeautifyAvailable(mockExecutor);
      expect(result).toBe(false);
    });

    it('should return false when executor throws an error', async () => {
      const mockExecutor = createMockExecutor({
        success: false,
        shouldThrow: new Error('execution failed'),
      });

      const result = await isXcbeautifyAvailable(mockExecutor);
      expect(result).toBe(false);
    });

    it('should cache the result after first successful call', async () => {
      let callCount = 0;
      const trackingExecutor = async () => {
        callCount++;
        return { success: true, output: '', process: { pid: 1 } };
      };

      await isXcbeautifyAvailable(trackingExecutor as any);
      await isXcbeautifyAvailable(trackingExecutor as any);

      expect(callCount).toBe(1);
    });

    it('should cache the result after first failed call', async () => {
      let callCount = 0;
      const trackingExecutor = async () => {
        callCount++;
        return { success: false, output: '', error: 'not found', process: { pid: 1 } };
      };

      await isXcbeautifyAvailable(trackingExecutor as any);
      await isXcbeautifyAvailable(trackingExecutor as any);

      expect(callCount).toBe(1);
    });
  });

  describe('resetXcbeautifyCache', () => {
    beforeEach(() => {
      resetXcbeautifyCache();
    });

    it('should reset cache allowing fresh availability check', async () => {
      // First call - returns true
      const successExecutor = createMockExecutor({ success: true, output: '' });
      const firstResult = await isXcbeautifyAvailable(successExecutor);
      expect(firstResult).toBe(true);

      // Reset cache
      resetXcbeautifyCache();

      // Second call with different executor - should call executor again
      const failExecutor = createMockExecutor({ success: false, error: 'not found' });
      const secondResult = await isXcbeautifyAvailable(failExecutor);
      expect(secondResult).toBe(false);
    });
  });
});
