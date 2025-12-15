import { createBuildDeviceToolDefinition } from './_build_device.ts';

export default createBuildDeviceToolDefinition(
  'build_device_quiet',
  'Builds an app for a connected device (xcbeautify -q).',
  1,
);

