import { createBuildDeviceToolDefinition } from './_build_device.ts';

export default createBuildDeviceToolDefinition(
  'build_device_error',
  'Builds an app for a connected device (xcbeautify -qq, errors only).',
  2,
);

