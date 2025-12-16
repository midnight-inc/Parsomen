-- Migration to fix Book-Category relationship
-- This changes Book.category from String to proper relation

-- Step 1: Since we're changing schema significantly, we'll need to handle existing data
-- For SQLite, we need to check if there's existing data that needs migration

-- First, let's just create the migration file
-- Run: npx prisma migrate dev --name fix-book-category-relation

-- If you have existing books with string categories, you'll need to:
-- 1. Create categories if they don't exist
-- 2. Update books to use categoryId instead of category string

-- Example SQL to run AFTER migration if needed:
-- INSERT OR IGNORE INTO Category (name) SELECT DISTINCT category FROM Book WHERE category IS NOT NULL;
-- UPDATE Book SET categoryId = (SELECT id FROM Category WHERE Category.name = Book.category) WHERE category IS NOT NULL;
