/**
 * Build Utilities - Higher-level abstractions for Xcode build operations
 *
 * This utility module provides specialized functions for build-related operations
 * across different platforms (macOS, iOS, watchOS, etc.). It serves as a higher-level
 * abstraction layer on top of the core Xcode utilities.
 *
 * Responsibilities:
 * - Providing a unified interface (executeXcodeBuild) for all build operations
 * - Handling build-specific parameter formatting and validation
 * - Standardizing response formatting for build results
 * - Managing build-specific error handling and reporting
 * - Supporting various build actions (build, clean, showBuildSettings, etc.)
 * - Supporting xcodemake as an alternative build strategy for faster incremental builds
 *
 * This file depends on the lower-level utilities in xcode.ts for command execution
 * while adding build-specific behavior, formatting, and error handling.
 */

import { log } from './logger.ts';
import { XcodePlatform, constructDestinationString } from './xcode.ts';
import { CommandExecutor, CommandExecOptions } from './command.ts';
import { ToolResponse, SharedBuildParams, PlatformBuildOptions } from '../types/common.ts';
import { createTextResponse, consolidateContentForClaudeCode } from './validation.ts';
import {
  isXcodemakeEnabled,
  isXcodemakeAvailable,
  executeXcodemakeCommand,
  executeMakeCommand,
  doesMakefileExist,
  doesMakeLogFileExist,
} from './xcodemake.ts';
import path from 'path';

type BuildOutputMode = 'guided' | 'diagnostics';

function getBuildOutputMode(): BuildOutputMode {
  const raw = process.env.XCODEBUILDMCP_BUILD_OUTPUT;
  if (raw === 'diagnostics') return 'diagnostics';
  return 'guided';
}

function isTestEnvironment(): boolean {
  return process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function formatDiagnosticsBlocks(
  warnings: string[],
  errors: string[],
): Array<{ type: 'text'; text: string }> {
  const content: Array<{ type: 'text'; text: string }> = [];

  const pushSection = (title: string, lines: string[]) => {
    if (lines.length === 0) return;
    const body = [
      title,
      ...lines.map((line) => `- ${line}`),
    ].join('\n');
    content.push({ type: 'text', text: body });
  };

  pushSection(`❌ Errors (${errors.length})`, errors);
  pushSection(`⚠️ Warnings (${warnings.length})`, warnings);

  return content;
}

let cachedXcbeautifyAvailable: boolean | undefined;

/**
 * Reset xcbeautify availability cache (for testing purposes)
 */
export function resetXcbeautifyCache(): void {
  cachedXcbeautifyAvailable = undefined;
}

export async function isXcbeautifyAvailable(
  executor: CommandExecutor,
  execOpts?: CommandExecOptions,
): Promise<boolean> {
  if (cachedXcbeautifyAvailable !== undefined) return cachedXcbeautifyAvailable;
  try {
    const result = await executor(
      ['bash', '-lc', 'command -v xcbeautify >/dev/null 2>&1'],
      'Check xcbeautify',
      false,
      execOpts,
    );
    cachedXcbeautifyAvailable = result.success;
    return result.success;
  } catch {
    cachedXcbeautifyAvailable = false;
    return false;
  }
}

function shellQuote(arg: string): string {
  if (!/[\s,"'=$`;&|<>(){}[\]\\*?~]/.test(arg) || /^".*"$/.test(arg)) {
    return arg;
  }
  return `"${arg.replace(/(["\\])/g, '\\$1')}"`;
}

function buildShellCommand(args: string[]): string {
  return args.map(shellQuote).join(' ');
}

export function getXcbeautifyArgs(quietLevel: 0 | 1 | 2): string[] {
  if (quietLevel === 1) return ['xcbeautify', '-q'];
  if (quietLevel === 2) return ['xcbeautify', '-qq'];
  return ['xcbeautify'];
}

export function getXcbeautifyInstallPrompt(): string {
  return [
    '⚠️ xcbeautify가 설치되어 있지 않아 기본 출력 포맷팅을 적용할 수 없습니다.',
    '설치 방법:',
    '- Homebrew: brew install xcbeautify',
    '- 또는: https://github.com/cpisciotta/xcbeautify',
  ].join('\n');
}

/**
 * Common function to execute an Xcode build command across platforms
 * @param params Common build parameters
 * @param platformOptions Platform-specific options
 * @param preferXcodebuild Whether to prefer xcodebuild over xcodemake, useful for if xcodemake is failing
 * @param buildAction The xcodebuild action to perform (e.g., 'build', 'clean', 'test')
 * @param executor Optional command executor for dependency injection (used for testing)
 * @returns Promise resolving to tool response
 */
export async function executeXcodeBuildCommand(
  params: SharedBuildParams,
  platformOptions: PlatformBuildOptions,
  preferXcodebuild: boolean = false,
  buildAction: string = 'build',
  executor: CommandExecutor,
  execOpts?: CommandExecOptions,
): Promise<ToolResponse> {
  const outputMode = getBuildOutputMode();
  const shouldUseXcbeautify = !isTestEnvironment();
  const xcbeautifyQuietLevel: 0 | 1 | 2 = platformOptions.xcbeautify?.quietLevel ?? 0;

  // Collect warnings, errors, and stderr messages from the build output
  const buildMessages: { type: 'text'; text: string }[] = [];
  function grepWarningsAndErrors(text: string): { type: 'warning' | 'error'; content: string }[] {
    return text
      .split('\n')
      .map((content) => {
        if (/warning:/i.test(content)) return { type: 'warning', content };
        if (/error:/i.test(content)) return { type: 'error', content };
        return null;
      })
      .filter(Boolean) as { type: 'warning' | 'error'; content: string }[];
  }

  log('info', `Starting ${platformOptions.logPrefix} ${buildAction} for scheme ${params.scheme}`);

  // Check if xcodemake is enabled and available
  const isXcodemakeEnabledFlag = isXcodemakeEnabled();
  let xcodemakeAvailableFlag = false;

  if (isXcodemakeEnabledFlag && buildAction === 'build') {
    xcodemakeAvailableFlag = await isXcodemakeAvailable();

    if (xcodemakeAvailableFlag && preferXcodebuild) {
      log(
        'info',
        'xcodemake is enabled but preferXcodebuild is set to true. Falling back to xcodebuild.',
      );
      if (outputMode === 'guided') {
        buildMessages.push({
          type: 'text',
          text: '⚠️ incremental build support is enabled but preferXcodebuild is set to true. Falling back to xcodebuild.',
        });
      }
    } else if (!xcodemakeAvailableFlag) {
      if (outputMode === 'guided') {
        buildMessages.push({
          type: 'text',
          text: '⚠️ xcodemake is enabled but not available. Falling back to xcodebuild.',
        });
      }
      log('info', 'xcodemake is enabled but not available. Falling back to xcodebuild.');
    } else {
      log('info', 'xcodemake is enabled and available, using it for incremental builds.');
      if (outputMode === 'guided') {
        buildMessages.push({
          type: 'text',
          text: 'ℹ️ xcodemake is enabled and available, using it for incremental builds.',
        });
      }
    }
  }

  try {
    const command = ['xcodebuild'];

    let projectDir = '';
    if (params.workspacePath) {
      projectDir = path.dirname(params.workspacePath);
      command.push('-workspace', params.workspacePath);
    } else if (params.projectPath) {
      projectDir = path.dirname(params.projectPath);
      command.push('-project', params.projectPath);
    }

    command.push('-scheme', params.scheme);
    command.push('-configuration', params.configuration);
    command.push('-skipMacroValidation');

    // Construct destination string based on platform
    let destinationString: string;
    const isSimulatorPlatform = [
      XcodePlatform.iOSSimulator,
      XcodePlatform.watchOSSimulator,
      XcodePlatform.tvOSSimulator,
      XcodePlatform.visionOSSimulator,
    ].includes(platformOptions.platform);

    if (isSimulatorPlatform) {
      if (platformOptions.simulatorId) {
        destinationString = constructDestinationString(
          platformOptions.platform,
          undefined,
          platformOptions.simulatorId,
        );
      } else if (platformOptions.simulatorName) {
        destinationString = constructDestinationString(
          platformOptions.platform,
          platformOptions.simulatorName,
          undefined,
          platformOptions.useLatestOS,
        );
      } else {
        return createTextResponse(
          `For ${platformOptions.platform} platform, either simulatorId or simulatorName must be provided`,
          true,
        );
      }
    } else if (platformOptions.platform === XcodePlatform.macOS) {
      destinationString = constructDestinationString(
        platformOptions.platform,
        undefined,
        undefined,
        false,
        platformOptions.arch,
      );
    } else if (platformOptions.platform === XcodePlatform.iOS) {
      if (platformOptions.deviceId) {
        destinationString = `platform=iOS,id=${platformOptions.deviceId}`;
      } else {
        destinationString = 'generic/platform=iOS';
      }
    } else if (platformOptions.platform === XcodePlatform.watchOS) {
      if (platformOptions.deviceId) {
        destinationString = `platform=watchOS,id=${platformOptions.deviceId}`;
      } else {
        destinationString = 'generic/platform=watchOS';
      }
    } else if (platformOptions.platform === XcodePlatform.tvOS) {
      if (platformOptions.deviceId) {
        destinationString = `platform=tvOS,id=${platformOptions.deviceId}`;
      } else {
        destinationString = 'generic/platform=tvOS';
      }
    } else if (platformOptions.platform === XcodePlatform.visionOS) {
      if (platformOptions.deviceId) {
        destinationString = `platform=visionOS,id=${platformOptions.deviceId}`;
      } else {
        destinationString = 'generic/platform=visionOS';
      }
    } else {
      return createTextResponse(`Unsupported platform: ${platformOptions.platform}`, true);
    }

    command.push('-destination', destinationString);

    if (params.derivedDataPath) {
      command.push('-derivedDataPath', params.derivedDataPath);
    }

    if (params.extraArgs && params.extraArgs.length > 0) {
      command.push(...params.extraArgs);
    }

    command.push(buildAction);

    // Execute the command using xcodemake or xcodebuild
    let result;
    if (
      isXcodemakeEnabledFlag &&
      xcodemakeAvailableFlag &&
      buildAction === 'build' &&
      !preferXcodebuild
    ) {
      // Check if Makefile already exists
      const makefileExists = doesMakefileExist(projectDir);
      log('debug', 'Makefile exists: ' + makefileExists);

      // Check if Makefile log already exists
      const makeLogFileExists = doesMakeLogFileExist(projectDir, command);
      log('debug', 'Makefile log exists: ' + makeLogFileExists);

      if (makefileExists && makeLogFileExists) {
        // Use make for incremental builds
        buildMessages.push({
          type: 'text',
          text: 'ℹ️ Using make for incremental build',
        });
        result = await executeMakeCommand(projectDir, platformOptions.logPrefix);
      } else {
        // Generate Makefile using xcodemake
        buildMessages.push({
          type: 'text',
          text: 'ℹ️ Generating Makefile with xcodemake (first build may take longer)',
        });
        // Remove 'xcodebuild' from the command array before passing to executeXcodemakeCommand
        result = await executeXcodemakeCommand(
          projectDir,
          command.slice(1),
          platformOptions.logPrefix,
        );
      }
    } else {
      // Use standard xcodebuild
      const xcbeautifyAvailable =
        shouldUseXcbeautify && (await isXcbeautifyAvailable(executor, execOpts));

      if (shouldUseXcbeautify && !xcbeautifyAvailable) {
        const prompt = getXcbeautifyInstallPrompt();
        if (outputMode === 'guided') {
          buildMessages.push({ type: 'text', text: prompt });
        }
      }

      if (xcbeautifyAvailable) {
        const xcodebuildCmd = buildShellCommand(command);
        const xcbeautifyCmd = buildShellCommand(getXcbeautifyArgs(xcbeautifyQuietLevel));
        const pipeline = `set -o pipefail; ${xcodebuildCmd} 2>&1 | ${xcbeautifyCmd}`;
        result = await executor(['bash', '-lc', pipeline], platformOptions.logPrefix, false, execOpts);
      } else {
        result = await executor(command, platformOptions.logPrefix, true, execOpts);
      }
    }

    // Grep warnings and errors from stdout (build output)
    const warningOrErrorLines = grepWarningsAndErrors(result.output);

    const warnings = dedupeLines(
      warningOrErrorLines.filter(({ type }) => type === 'warning').map(({ content }) => content),
    );
    const errorsFromStdout = dedupeLines(
      warningOrErrorLines.filter(({ type }) => type === 'error').map(({ content }) => content),
    );
    const errorsFromStderr = dedupeLines(
      (result.error ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `[stderr] ${line}`),
    );

    const errors = dedupeLines([...errorsFromStdout, ...errorsFromStderr]);

    if (shouldUseXcbeautify && cachedXcbeautifyAvailable === false) {
      const prompt = getXcbeautifyInstallPrompt();
      if (outputMode === 'diagnostics') {
        warnings.unshift(prompt);
      }
    }

    if (outputMode === 'guided') {
      warnings.forEach((content) => {
        buildMessages.push({ type: 'text', text: `⚠️ Warning: ${content}` });
      });
      errors.forEach((content) => {
        const text = content.startsWith('[stderr] ') ? `❌ ${content}` : `❌ Error: ${content}`;
        buildMessages.push({ type: 'text', text });
      });
    }

    if (!result.success) {
      const isMcpError = result.exitCode === 64;

      log(
        isMcpError ? 'error' : 'warning',
        `${platformOptions.logPrefix} ${buildAction} failed: ${result.error ?? '(no stderr; see formatted output)'}`,
        { sentry: isMcpError },
      );
      const errorResponse =
        outputMode === 'diagnostics'
          ? ({
              content: [
                ...formatDiagnosticsBlocks(warnings, errors),
                {
                  type: 'text',
                  text: `❌ ${platformOptions.logPrefix} ${buildAction} failed for scheme ${params.scheme}.`,
                },
              ],
              isError: true,
            } satisfies ToolResponse)
          : createTextResponse(
              `❌ ${platformOptions.logPrefix} ${buildAction} failed for scheme ${params.scheme}.`,
              true,
            );

      if (outputMode === 'guided' && buildMessages.length > 0 && errorResponse.content) {
        errorResponse.content.unshift(...buildMessages);
      }

      // If using xcodemake and build failed but no compiling errors, suggest using xcodebuild
      if (
        outputMode === 'guided' &&
        warningOrErrorLines.length == 0 &&
        isXcodemakeEnabledFlag &&
        xcodemakeAvailableFlag &&
        buildAction === 'build' &&
        !preferXcodebuild
      ) {
        errorResponse.content.push({
          type: 'text',
          text: `💡 Incremental build using xcodemake failed, suggest using preferXcodebuild option to try build again using slower xcodebuild command.`,
        });
      }

      return consolidateContentForClaudeCode(errorResponse);
    }

    log('info', `✅ ${platformOptions.logPrefix} ${buildAction} succeeded.`);

    // Create additional info based on platform and action
    let additionalInfo = '';

    // Add xcodemake info if relevant
    if (
      isXcodemakeEnabledFlag &&
      xcodemakeAvailableFlag &&
      buildAction === 'build' &&
      !preferXcodebuild
    ) {
      additionalInfo += `xcodemake: Using faster incremental builds with xcodemake. 
Future builds will use the generated Makefile for improved performance.

`;
    }

    // Only show next steps for 'build' action
    if (buildAction === 'build') {
      if (platformOptions.platform === XcodePlatform.macOS) {
        additionalInfo = `Next Steps:
1. Get app path: get_mac_app_path({ scheme: '${params.scheme}' })
2. Get bundle ID: get_mac_bundle_id({ appPath: 'PATH_FROM_STEP_1' })
3. Launch: launch_mac_app({ appPath: 'PATH_FROM_STEP_1' })`;
      } else if (platformOptions.platform === XcodePlatform.iOS) {
        additionalInfo = `Next Steps:
1. Get app path: get_device_app_path({ scheme: '${params.scheme}' })
2. Get bundle ID: get_app_bundle_id({ appPath: 'PATH_FROM_STEP_1' })
3. Launch: launch_app_device({ bundleId: 'BUNDLE_ID_FROM_STEP_2' })`;
      } else if (isSimulatorPlatform) {
        const simIdParam = platformOptions.simulatorId ? 'simulatorId' : 'simulatorName';
        const simIdValue = platformOptions.simulatorId ?? platformOptions.simulatorName;

        additionalInfo = `Next Steps:
1. Get app path: get_sim_app_path({ ${simIdParam}: '${simIdValue}', scheme: '${params.scheme}', platform: 'iOS Simulator' })
2. Get bundle ID: get_app_bundle_id({ appPath: 'PATH_FROM_STEP_1' })
3. Launch: launch_app_sim({ ${simIdParam}: '${simIdValue}', bundleId: 'BUNDLE_ID_FROM_STEP_2' })
   Or with logs: launch_app_logs_sim({ ${simIdParam}: '${simIdValue}', bundleId: 'BUNDLE_ID_FROM_STEP_2' })`;
      }
    }

    const successResponse: ToolResponse =
      outputMode === 'diagnostics'
        ? ({
            content:
              warnings.length === 0 && errors.length === 0
                ? [
                    {
                      type: 'text',
                      text: `✅ ${platformOptions.logPrefix} ${buildAction} succeeded for scheme ${params.scheme} (no warnings/errors).`,
                    },
                  ]
                : [
                    ...formatDiagnosticsBlocks(warnings, errors),
                    {
                      type: 'text',
                      text: `✅ ${platformOptions.logPrefix} ${buildAction} succeeded for scheme ${params.scheme}.`,
                    },
                  ],
            isError: false,
          } satisfies ToolResponse)
        : {
            content: [
              ...buildMessages,
              {
                type: 'text',
                text: `✅ ${platformOptions.logPrefix} ${buildAction} succeeded for scheme ${params.scheme}.`,
              },
            ],
          };

    // Only add additional info if we have any
    if (outputMode === 'guided' && additionalInfo) {
      successResponse.content.push({
        type: 'text',
        text: additionalInfo,
      });
    }

    return consolidateContentForClaudeCode(successResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    const isSpawnError =
      error instanceof Error &&
      'code' in error &&
      ['ENOENT', 'EACCES', 'EPERM'].includes((error as NodeJS.ErrnoException).code ?? '');

    log('error', `Error during ${platformOptions.logPrefix} ${buildAction}: ${errorMessage}`, {
      sentry: !isSpawnError,
    });

    return consolidateContentForClaudeCode(
      createTextResponse(
        `Error during ${platformOptions.logPrefix} ${buildAction}: ${errorMessage}`,
        true,
      ),
    );
  }
}
