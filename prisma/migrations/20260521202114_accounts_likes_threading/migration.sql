-- =============================================================
-- accounts_likes_threading
-- Adds public user accounts (username login), post + comment
-- likes, threaded comments, and a notifications table.
-- =============================================================

-- 1. Role enum: add USER value
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';

-- 2. User table: add username (nullable -> populated -> NOT NULL),
-- make email nullable.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
-- Backfill: existing admin gets a username derived from their email
UPDATE "User"
   SET "username" = lower(split_part("email", '@', 1))
 WHERE "username" IS NULL AND "email" IS NOT NULL;
-- For any rows that somehow lack both, fall back to id-based handle
UPDATE "User"
   SET "username" = 'user_' || substr("id", 1, 10)
 WHERE "username" IS NULL;
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- 3. Post: denormalised likeCount
ALTER TABLE "Post" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

-- 4. Comment: userId (FK), parentId (self-FK for threading), likeCount
ALTER TABLE "Comment" ADD COLUMN "userId" TEXT;
ALTER TABLE "Comment" ADD COLUMN "parentId" TEXT;
ALTER TABLE "Comment" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Comment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
-- Replace the old (postId, createdAt) index with one that also keys parentId
DROP INDEX IF EXISTS "Comment_postId_createdAt_idx";
CREATE INDEX "Comment_postId_parentId_createdAt_idx"
  ON "Comment"("postId", "parentId", "createdAt" DESC);

-- 5. PostLike
CREATE TABLE "PostLike" (
  "id"        TEXT NOT NULL,
  "postId"    TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");
ALTER TABLE "PostLike"
  ADD CONSTRAINT "PostLike_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "Post"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostLike"
  ADD CONSTRAINT "PostLike_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. CommentLike
CREATE TABLE "CommentLike" (
  "id"        TEXT NOT NULL,
  "commentId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CommentLike_commentId_userId_key" ON "CommentLike"("commentId", "userId");
CREATE INDEX "CommentLike_userId_idx" ON "CommentLike"("userId");
ALTER TABLE "CommentLike"
  ADD CONSTRAINT "CommentLike_commentId_fkey"
  FOREIGN KEY ("commentId") REFERENCES "Comment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentLike"
  ADD CONSTRAINT "CommentLike_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Notification + NotificationType enum
CREATE TYPE "NotificationType" AS ENUM ('COMMENT_REPLY', 'COMMENT_LIKE');

CREATE TABLE "Notification" (
  "id"          TEXT NOT NULL,
  "type"        "NotificationType" NOT NULL,
  "recipientId" TEXT NOT NULL,
  "actorId"     TEXT NOT NULL,
  "commentId"   TEXT,
  "postSlug"    TEXT,
  "read"        BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_recipientId_read_createdAt_idx"
  ON "Notification"("recipientId", "read", "createdAt" DESC);
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_recipientId_fkey"
  FOREIGN KEY ("recipientId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_commentId_fkey"
  FOREIGN KEY ("commentId") REFERENCES "Comment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
