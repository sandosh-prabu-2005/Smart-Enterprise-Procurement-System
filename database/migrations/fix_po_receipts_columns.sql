-- Fix: po_receipts table was missing 5 columns that the POReceipt.java
-- entity expects, causing "column p1_0.damaged_qty does not exist" (and
-- similar) 500 errors on every PO detail / Receiving screen load.
-- Safe to re-run: IF NOT EXISTS means this won't fail if already applied.

ALTER TABLE po_receipts ADD COLUMN IF NOT EXISTS damaged_qty INTEGER DEFAULT 0;
ALTER TABLE po_receipts ADD COLUMN IF NOT EXISTS item_condition VARCHAR(50);
ALTER TABLE po_receipts ADD COLUMN IF NOT EXISTS warehouse VARCHAR(100);
ALTER TABLE po_receipts ADD COLUMN IF NOT EXISTS remarks VARCHAR(1000);
ALTER TABLE po_receipts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'RECEIVED';
