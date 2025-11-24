-- Add sponsorship_level to partners table per PRD tiered visibility
ALTER TABLE public.partners 
ADD COLUMN sponsorship_level text 
NOT NULL 
DEFAULT 'bronze' 
CHECK (sponsorship_level IN ('bronze', 'silver', 'gold', 'platinum'));

-- Ensure all existing partners have the level set (redundant with DEFAULT but explicit)
UPDATE public.partners 
SET sponsorship_level = 'bronze' 
WHERE sponsorship_level IS NULL;

-- Index for query performance on tier filtering/sorting
CREATE INDEX idx_partners_sponsorship_level ON public.partners(sponsorship_level);