-- Add category and pdf_url columns to books table
ALTER TABLE books 
ADD COLUMN category text NOT NULL DEFAULT 'general',
ADD COLUMN pdf_url text;

-- Add check constraint for valid categories
ALTER TABLE books 
ADD CONSTRAINT valid_category CHECK (
  category IN ('fiction', 'non-fiction', 'textbook', 'programming', 'science', 'history', 'biography', 'pdf-books', 'general')
);