import { createBuildMacOSToolDefinition } from './_build_macos.ts';

export default createBuildMacOSToolDefinition(
  'build_macos_error',
  'Builds a macOS app (xcbeautify -qq, errors only).',
  2,
);

