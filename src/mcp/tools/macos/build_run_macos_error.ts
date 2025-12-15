import { createBuildRunMacOSToolDefinition } from './_build_run_macos.ts';

export default createBuildRunMacOSToolDefinition(
  'build_run_macos_error',
  'Builds and runs a macOS app (xcbeautify -qq, errors only).',
  2,
);

