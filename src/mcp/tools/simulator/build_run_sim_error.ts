import { createBuildRunSimToolDefinition } from './_build_run_sim.ts';

export default createBuildRunSimToolDefinition(
  'build_run_sim_error',
  'Builds and runs an app on an iOS simulator (xcbeautify -qq, errors only).',
  2,
);

