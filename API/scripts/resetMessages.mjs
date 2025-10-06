import mongoose from "mongoose";
import '../src/models/Conversation.js';
import '../src/models/Message.js';
import '../src/models/Project.js';
import { config } from "../src/config/env.js";
import { messagingService } from "../src/services/messaging.service.js";
import { Message } from "../src/models/Message.js";
import { Conversation } from "../src/models/Conversation.js";
import { Project } from "../src/models/Project.js";

async function main() {
  await mongoose.connect(config.mongoUri, { dbName: 'hilcoe_rms' });
  const cleared = await Message.deleteMany({});
  await Conversation.updateMany({}, { $unset: { last_message: "", last_message_at: "" }, $set: { read_markers: [] } });
  const projects = await Project.find({}, '_id').lean();
  for (const project of projects) {
    try {
      await messagingService.ensureProjectConversation(project._id);
    } catch (err) {
      console.warn('ensure conversation failed', project._id, err.message);
    }
  }
  console.log(`Deleted ${cleared.deletedCount} messages.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
