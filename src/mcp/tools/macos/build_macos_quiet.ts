import { createBuildMacOSToolDefinition } from './build_macos.ts';

export default createBuildMacOSToolDefinition(
  'build_macos_quiet',
  'Builds a macOS app (xcbeautify -q).',
  1,
);

