/**
 * Migration outline: split legacy milestone types into new granular types.
 *
 * Steps:
 * 1. For each project, map existing milestones of type `progress` to
 *    `progress1` (first submission) and optionally create a draft `progress2`
 *    milestone if none exists yet.
 * 2. Convert milestones of type `thesis` to `thesis_precheck` and generate a
 *    pending `thesis_postdefense` milestone when the project has not yet
 *    archived the thesis stage.
 * 3. Recalculate `sequence` values using the DEFAULT_SEQUENCES mapping from
 *    `milestones.service.js`.
 * 4. Run once with: `node scripts/migrate-milestones.mjs` after setting
 *    `MONGO_URI` to the Atlas cluster.
 */
import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import { Milestone } from '../src/models/Milestone.js';

const DEFAULT_SEQUENCES = {
  registration: 10,
  synopsis: 20,
  proposal: 30,
  progress1: 40,
  progress2: 50,
  thesis_precheck: 60,
  thesis_postdefense: 70,
  defense: 80,
  journal: 90,
};

(async () => {
  await connectMongo();
  console.log('Connected. Review the logic in this script before executing the migration.');

  // TODO: implement migration logic as described above.

  await mongoose.disconnect();
})();
