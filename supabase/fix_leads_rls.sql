-- Supabase RLS Fix for leads update policy

-- This policy allows a user to update a lead ONLY IF they are the owner of the property associated with that lead.
CREATE POLICY "Owners can update leads for their properties" 
ON "public"."leads"
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = leads.property_id
    AND properties.owner_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = leads.property_id
    AND properties.owner_id = auth.uid()
  )
);
