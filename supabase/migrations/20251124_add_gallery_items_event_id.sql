-- Add event_id column to gallery_items table
-- Allows linking gallery items to specific events (nullable for existing items)

ALTER TABLE gallery_items 
ADD COLUMN event_id uuid 
REFERENCES events(id) ON DELETE SET NULL;

-- Optional index for better query performance on event-specific gallery filtering
CREATE INDEX idx_gallery_items_event_id ON gallery_items(event_id);