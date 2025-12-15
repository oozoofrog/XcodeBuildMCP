import { createBuildSimToolDefinition } from './build_sim.ts';

export default createBuildSimToolDefinition(
  'build_sim_error',
  'Builds an app for an iOS simulator (xcbeautify -qq, errors only).',
  2,
);

