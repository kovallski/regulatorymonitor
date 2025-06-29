/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `EmailSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `EmailSettings_email_key` ON `EmailSettings`(`email`);
