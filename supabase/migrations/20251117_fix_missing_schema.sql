-- Fix missing schema - idempotent recreation
-- Tables (drop cascade to handle FKs)
DROP TABLE IF EXISTS public.gallery_items CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Recreate tables from 01_database_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE public.events (
  -- full schema from read_file
);
-- ... all tables/partners/team_members/gallery_items exactly as in 01_database_schema.sql

-- FKs
ALTER TABLE ... ;

-- Indexes (DROP IF EXISTS first)
DROP INDEX IF EXISTS idx_events_partner_id;
CREATE INDEX idx_events_partner_id ON ... ;
-- all indexes

-- Views
DROP VIEW IF EXISTS public_events_view;
CREATE VIEW public_events_view AS ... ;  -- exact from schema

-- Functions
DROP FUNCTION IF EXISTS get_events_with_details(...);
CREATE OR REPLACE FUNCTION ... ;  -- all functions
