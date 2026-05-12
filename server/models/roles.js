import mongoose from 'mongoose';
import { MODULES, ACTIONS } from '../config/constants.js';

const { Schema, model, Types } = mongoose;

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false, // System roles cannot be deleted
    },
    permissions: {
      // Students module
      students: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        assign: { type: Boolean, default: false },
        updateStatus: { type: Boolean, default: false },
        followup: { type: Boolean, default: false },
        assignedOnly: { type: Boolean, default: false }, // Can only see assigned students
        export: { type: Boolean, default: false },
        import: { type: Boolean, default: false },
      },
      // Users module
      users: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      // Roles module
      roles: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      // Applications module
      applications: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        reject: { type: Boolean, default: false },
        assignedOnly: { type: Boolean, default: false },
      },
      // Documents module
      documents: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        reject: { type: Boolean, default: false },
      },
      // Payments module
      payments: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      // Notifications module
      notifications: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      // Todos module
      todos: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      // Reports module
      reports: {
        read: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      // Settings module
      settings: {
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
      },
      // MCP module
      mcp: {
        read: { type: Boolean, default: false },
        query: { type: Boolean, default: false },
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    history: [
      {
        type: {
          type: String,
          trim: true,
          required: true,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
          required: true,
        },
        actionDoneBy: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for performance
RoleSchema.index({ active: 1 });
RoleSchema.index({ name: 1 });

export default model('Role', RoleSchema);
