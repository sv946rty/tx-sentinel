-- Enable pgvector extension for vector similarity search
-- This must be run BEFORE the 0002_known_lily_hollister.sql migration
-- Run this in Supabase SQL Editor or via psql

CREATE EXTENSION IF NOT EXISTS vector;
