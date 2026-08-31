-- Migration to convert integer PK and FK columns and sequences to bigint
ALTER SEQUENCE public.roles_role_id_seq AS bigint;
ALTER SEQUENCE public.cost_centers_cost_center_id_seq AS bigint;
ALTER SEQUENCE public.departments_department_id_seq AS bigint;
ALTER SEQUENCE public.users_user_id_seq AS bigint;
ALTER SEQUENCE public.user_roles_user_role_id_seq AS bigint;
ALTER SEQUENCE public.categories_category_id_seq AS bigint;
ALTER SEQUENCE public.suppliers_supplier_id_seq AS bigint;
ALTER SEQUENCE public.approval_rules_rule_id_seq AS bigint;
ALTER SEQUENCE public.approval_rule_approvers_rule_approver_id_seq AS bigint;
ALTER SEQUENCE public.requisitions_requisition_id_seq AS bigint;
ALTER SEQUENCE public.requisition_line_items_line_item_id_seq AS bigint;
ALTER SEQUENCE public.requisition_history_history_id_seq AS bigint;
ALTER SEQUENCE public.purchase_orders_po_id_seq AS bigint;
ALTER SEQUENCE public.po_line_items_po_line_item_id_seq AS bigint;
ALTER SEQUENCE public.po_receipts_receipt_id_seq AS bigint;
ALTER SEQUENCE public.audit_logs_audit_id_seq AS bigint;

ALTER TABLE public.roles ALTER COLUMN role_id TYPE bigint;

ALTER TABLE public.cost_centers ALTER COLUMN cost_center_id TYPE bigint;

ALTER TABLE public.departments ALTER COLUMN department_id TYPE bigint;
ALTER TABLE public.departments ALTER COLUMN cost_center_id TYPE bigint;

ALTER TABLE public.users ALTER COLUMN user_id TYPE bigint;
ALTER TABLE public.users ALTER COLUMN department_id TYPE bigint;

ALTER TABLE public.user_roles ALTER COLUMN user_role_id TYPE bigint;
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE bigint;
ALTER TABLE public.user_roles ALTER COLUMN role_id TYPE bigint;

ALTER TABLE public.categories ALTER COLUMN category_id TYPE bigint;

ALTER TABLE public.suppliers ALTER COLUMN supplier_id TYPE bigint;

ALTER TABLE public.approval_rules ALTER COLUMN rule_id TYPE bigint;
ALTER TABLE public.approval_rules ALTER COLUMN department_id TYPE bigint;
ALTER TABLE public.approval_rules ALTER COLUMN category_id TYPE bigint;

ALTER TABLE public.approval_rule_approvers ALTER COLUMN rule_approver_id TYPE bigint;
ALTER TABLE public.approval_rule_approvers ALTER COLUMN rule_id TYPE bigint;
ALTER TABLE public.approval_rule_approvers ALTER COLUMN role_id TYPE bigint;

ALTER TABLE public.requisitions ALTER COLUMN requisition_id TYPE bigint;
ALTER TABLE public.requisitions ALTER COLUMN created_by TYPE bigint;
ALTER TABLE public.requisitions ALTER COLUMN department_id TYPE bigint;
ALTER TABLE public.requisitions ALTER COLUMN supplier_id TYPE bigint;
ALTER TABLE public.requisitions ALTER COLUMN category_id TYPE bigint;

ALTER TABLE public.requisition_line_items ALTER COLUMN line_item_id TYPE bigint;
ALTER TABLE public.requisition_line_items ALTER COLUMN requisition_id TYPE bigint;

ALTER TABLE public.requisition_history ALTER COLUMN history_id TYPE bigint;
ALTER TABLE public.requisition_history ALTER COLUMN requisition_id TYPE bigint;
ALTER TABLE public.requisition_history ALTER COLUMN action_by TYPE bigint;

ALTER TABLE public.purchase_orders ALTER COLUMN po_id TYPE bigint;
ALTER TABLE public.purchase_orders ALTER COLUMN requisition_id TYPE bigint;
ALTER TABLE public.purchase_orders ALTER COLUMN supplier_id TYPE bigint;

ALTER TABLE public.po_line_items ALTER COLUMN po_line_item_id TYPE bigint;
ALTER TABLE public.po_line_items ALTER COLUMN po_id TYPE bigint;

ALTER TABLE public.po_receipts ALTER COLUMN receipt_id TYPE bigint;
ALTER TABLE public.po_receipts ALTER COLUMN po_id TYPE bigint;
ALTER TABLE public.po_receipts ALTER COLUMN received_by TYPE bigint;

ALTER TABLE public.audit_logs ALTER COLUMN audit_id TYPE bigint;
ALTER TABLE public.audit_logs ALTER COLUMN user_id TYPE bigint;
ALTER TABLE public.audit_logs ALTER COLUMN entity_id TYPE bigint;
