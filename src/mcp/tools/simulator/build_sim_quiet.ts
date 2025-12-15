import { createBuildSimToolDefinition } from './_build_sim.ts';

export default createBuildSimToolDefinition(
  'build_sim_quiet',
  'Builds an app for an iOS simulator (xcbeautify -q).',
  1,
);

