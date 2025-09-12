import mongoose from 'mongoose';

/**
 * Creates a very permissive schema for fast iteration.
 * - strict:false allows any fields
 * - timestamps map to created_at / updated_at
 * - collection is explicitly set to match existing Mongo collections
 */
export function makeLooseModel(modelName, collectionName) {
  const schema = new mongoose.Schema({}, {
    strict: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: collectionName
  });
  return mongoose.models[modelName] || mongoose.model(modelName, schema, collectionName);
}