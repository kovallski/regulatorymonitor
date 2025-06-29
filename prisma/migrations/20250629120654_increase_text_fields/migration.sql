-- AlterTable
ALTER TABLE `newsitem` MODIFY `title` TEXT NOT NULL,
    MODIFY `summary` TEXT NOT NULL,
    MODIFY `sourceUrl` TEXT NOT NULL,
    MODIFY `documentRef` TEXT NULL,
    MODIFY `taxType` TEXT NULL,
    MODIFY `subject` TEXT NULL,
    MODIFY `position` TEXT NULL;
