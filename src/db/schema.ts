import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ================= NOTIFICATION ENUMS ================= */

export const notificationTypeEnum = pgEnum("notification_type", [
  "COMMENT",
  "REACTION",
]);

/* ================= USERS TABLE ================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ================= POSTS TABLE ================= */

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIndex: uniqueIndex("posts_slug_unique").on(table.slug),
    authorIndex: index("posts_author_idx").on(table.authorId),
  }),
);

/* ================= COMMENTS TABLE ================= */

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    postIndex: index("comments_post_idx").on(table.postId),
  }),
);

/* ================= REACTIONS TABLE ================= */

export const reactions = pgTable(
  "reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueReaction: uniqueIndex("unique_user_post_reaction").on(
      table.postId,
      table.userId,
    ),
  }),
);

/* ================= NOTIFICATIONS TABLE ================= */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: uuid("recipient_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    senderId: uuid("sender_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    recipientIndex: index("notifications_recipient_idx").on(table.recipientId),
    unreadIndex: index("notifications_unread_idx").on(
      table.recipientId,
      table.isRead,
    ),
  }),
);

/* ================= PASSWORD RESET ================= */

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- RELATIONS (For Drizzle Queries) ---
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  reactions: many(reactions),
  receivedNotifications: many(notifications, {
    relationName: "recipient",
  }),
  sentNotifications: many(notifications, {
    relationName: "sender",
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  post: one(posts, {
    fields: [notifications.postId],
    references: [posts.id],
  }),
}));
