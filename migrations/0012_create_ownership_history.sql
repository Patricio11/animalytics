-- Migration: Create ownership history table
-- Date: 2025-10-30
-- Description: Tracks ownership changes when animals are sold/transferred
-- Status: PLACEHOLDER - To be implemented when buyer/sale system is ready

/*
-- Uncomment when ready to implement ownership tracking

CREATE TABLE ownership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  
  -- Previous and new owner information
  previous_owner_id TEXT REFERENCES users(id),
  previous_owner_name TEXT, -- If external
  new_owner_id TEXT REFERENCES users(id),
  new_owner_name TEXT, -- If external
  
  -- Transfer details
  transfer_date TIMESTAMP NOT NULL DEFAULT NOW(),
  transfer_type TEXT NOT NULL, -- 'sale', 'gift', 'breeding_loan', 'co_ownership', 'return'
  
  -- Sale information (if applicable)
  sale_price INTEGER, -- in cents
  sale_currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- 'cash', 'bank_transfer', 'check', etc.
  
  -- Contract/Agreement
  contract_url TEXT, -- Link to signed contract/agreement
  has_breeding_rights BOOLEAN DEFAULT false,
  breeding_rights_notes TEXT,
  
  -- Additional details
  reason TEXT, -- Reason for transfer
  notes TEXT,
  
  -- Metadata
  recorded_by TEXT REFERENCES users(id), -- Who recorded this transfer
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_ownership_history_animal_id ON ownership_history(animal_id);
CREATE INDEX idx_ownership_history_previous_owner ON ownership_history(previous_owner_id);
CREATE INDEX idx_ownership_history_new_owner ON ownership_history(new_owner_id);
CREATE INDEX idx_ownership_history_transfer_date ON ownership_history(transfer_date);

-- Comments
COMMENT ON TABLE ownership_history IS 'Tracks complete ownership history of animals including sales and transfers';
COMMENT ON COLUMN ownership_history.transfer_type IS 'Type of ownership transfer: sale, gift, breeding_loan, co_ownership, return';
COMMENT ON COLUMN ownership_history.has_breeding_rights IS 'Whether new owner has breeding rights';

*/

-- Placeholder: This migration will be activated when implementing the buyer/sale system
SELECT 'Ownership history table migration placeholder created' AS status;
