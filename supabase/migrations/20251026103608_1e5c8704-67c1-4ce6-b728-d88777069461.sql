-- Add foreign key relationships
ALTER TABLE books 
ADD CONSTRAINT books_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE contact_requests 
ADD CONSTRAINT contact_requests_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE contact_requests 
ADD CONSTRAINT contact_requests_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Update admin RLS policies to allow viewing all data
DROP POLICY IF EXISTS "Admins can view all requests" ON contact_requests;

CREATE POLICY "Admins can view all requests"
ON contact_requests
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = requester_id OR 
  auth.uid() = seller_id
);

-- Ensure admin can delete books
CREATE POLICY "Admins can delete any book"
ON books
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = seller_id);