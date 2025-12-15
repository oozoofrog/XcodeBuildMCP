import { createBuildRunSimToolDefinition } from './_build_run_sim.ts';

export default createBuildRunSimToolDefinition(
  'build_run_sim_quiet',
  'Builds and runs an app on an iOS simulator (xcbeautify -q).',
  1,
);

