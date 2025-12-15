import { createBuildRunMacOSToolDefinition } from './build_run_macos.ts';

export default createBuildRunMacOSToolDefinition(
  'build_run_macos_quiet',
  'Builds and runs a macOS app (xcbeautify -q).',
  1,
);

