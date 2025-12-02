-- Add next cycle tracking fields to heat_cycles table
-- Migration: add_next_cycle_tracking
-- Created: 2025-12-02

ALTER TABLE heat_cycles 
ADD COLUMN IF NOT EXISTS next_expected_cycle_date DATE,
ADD COLUMN IF NOT EXISTS next_cycle_reminder_sent BOOLEAN DEFAULT FALSE;

-- Add index for querying cycles with upcoming reminders
CREATE INDEX IF NOT EXISTS idx_heat_cycles_next_expected_date 
ON heat_cycles(next_expected_cycle_date) 
WHERE next_cycle_reminder_sent = FALSE AND status = 'completed';

-- Add comment
COMMENT ON COLUMN heat_cycles.next_expected_cycle_date IS 'Expected date of next heat cycle (typically 6 months after completion)';
COMMENT ON COLUMN heat_cycles.next_cycle_reminder_sent IS 'Flag to track if reminder notification has been sent for next cycle';
