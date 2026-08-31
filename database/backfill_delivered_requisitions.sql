-- One-time backfill: for any Purchase Order that is already FULLY_DELIVERED
-- but whose requisition never got marked COMPLETED (because that logic
-- didn't exist yet when you tested), this closes the loop retroactively.
--
-- Going forward, new requisitions will update automatically the moment
-- they're fully received - this script is only needed once, for POs you
-- already fully received before the fix was deployed.

-- 1. Mark the requisition COMPLETED
UPDATE public.requisitions r
SET status = 'COMPLETED'
FROM public.purchase_orders po
WHERE po.requisition_id = r.requisition_id
  AND po.status = 'FULLY_DELIVERED'
  AND r.status <> 'COMPLETED';

-- 2. Add a "Delivered" history row so the timeline shows it, for any
--    requisition that just got marked COMPLETED but has no such row yet.
INSERT INTO public.requisition_history (requisition_id, action_by, step, remarks, action_date)
SELECT r.requisition_id, r.created_by, 'Delivered',
       'All ordered items received and confirmed delivered.', CURRENT_TIMESTAMP
FROM public.requisitions r
JOIN public.purchase_orders po ON po.requisition_id = r.requisition_id
WHERE po.status = 'FULLY_DELIVERED'
  AND r.status = 'COMPLETED'
  AND NOT EXISTS (
      SELECT 1 FROM public.requisition_history rh
      WHERE rh.requisition_id = r.requisition_id AND rh.step = 'Delivered'
  );
