import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {ITEM_KINDS} from "./ItemKinds";
import {users} from "./Users";

export const generationAttempts = sqliteTable(
  "generation_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {onDelete: "cascade"}),
    kind: text("kind", {enum: ITEM_KINDS}).notNull(),
    createdAt: integer("created_at", {mode: "timestamp"}).notNull(),
    pipelineVersion: text("pipeline_version").notNull(),
    outcome: text("outcome", {
      enum: ["first-pass-success", "repaired-success", "success-with-fallback", "rejected", "blocked", "failed"],
    }).notNull(),
    codeEdits: integer("code_edits").notNull(),
    modelRepairs: integer("model_repairs").notNull(),
    failureStage: text("failure_stage", {
      enum: ["precheck", "moderation", "validation", "storage", "availability", "spend", "credit", "pipeline"],
    }),
    failureReason: text("failure_reason"),
    prompt: text("prompt"),
  },
  table => [
    index("generation_attempts_created_at").on(table.createdAt),
    index("generation_attempts_user_id_created_at").on(table.userId, table.createdAt),
  ],
);
