-- ============================================================
-- Enterprise Procurement System
-- update_schema_1.sql
-- Purpose: Backward-compatible Phase 1 enterprise enhancements
-- Target: Existing enterprise_procurement PostgreSQL database
-- ============================================================

BEGIN;

-- ============================================================
-- 1. USERS ENHANCEMENTS
-- ============================================================

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS manager_id BIGINT,
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
    ADD COLUMN IF NOT EXISTS profile_photo TEXT,
    ADD COLUMN IF NOT EXISTS employee_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS office_location VARCHAR(100);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_manager'
    ) THEN
        ALTER TABLE public.users
            ADD CONSTRAINT fk_users_manager
            FOREIGN KEY (manager_id)
            REFERENCES public.users(user_id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================
-- 2. DEPARTMENTS ENHANCEMENTS
-- ============================================================

ALTER TABLE public.departments
    ADD COLUMN IF NOT EXISTS department_head VARCHAR(100),
    ADD COLUMN IF NOT EXISTS email VARCHAR(100),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ============================================================
-- 3. COST CENTER ENHANCEMENTS
-- ============================================================

ALTER TABLE public.cost_centers
    ADD COLUMN IF NOT EXISTS budget_limit NUMERIC(18,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS financial_year VARCHAR(10);

-- ============================================================
-- 4. SUPPLIER ENHANCEMENTS
-- ============================================================

ALTER TABLE public.suppliers
    ADD COLUMN IF NOT EXISTS gst_number VARCHAR(30),
    ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100),
    ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
    ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS preferred_supplier BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_suppliers_rating'
    ) THEN
        ALTER TABLE public.suppliers
            ADD CONSTRAINT chk_suppliers_rating
            CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));
    END IF;
END $$;

-- ============================================================
-- 5. CATEGORY ENHANCEMENTS
-- ============================================================

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS icon VARCHAR(100),
    ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- ============================================================
-- 6. REQUISITION ENHANCEMENTS
-- ============================================================

ALTER TABLE public.requisitions
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'MEDIUM',
    ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
    ADD COLUMN IF NOT EXISTS project_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS budget_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS returned_by BIGINT,
    ADD COLUMN IF NOT EXISTS return_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_requisitions_returned_by'
    ) THEN
        ALTER TABLE public.requisitions
            ADD CONSTRAINT fk_requisitions_returned_by
            FOREIGN KEY (returned_by)
            REFERENCES public.users(user_id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_requisition_priority'
    ) THEN
        ALTER TABLE public.requisitions
            ADD CONSTRAINT chk_requisition_priority
            CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
    END IF;
END $$;

-- ============================================================
-- 7. PURCHASE ORDER ENHANCEMENTS
-- ============================================================

ALTER TABLE public.purchase_orders
    ADD COLUMN IF NOT EXISTS expected_delivery DATE,
    ADD COLUMN IF NOT EXISTS actual_delivery DATE,
    ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(18,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(18,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount NUMERIC(18,2) DEFAULT 0;

-- ============================================================
-- 8. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(user_id)
        ON DELETE CASCADE
);

-- ============================================================
-- 9. REQUISITION COMMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.requisition_comments (
    comment_id BIGSERIAL PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requisition_comments_requisition
        FOREIGN KEY (requisition_id)
        REFERENCES public.requisitions(requisition_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_requisition_comments_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(user_id)
        ON DELETE RESTRICT
);

-- ============================================================
-- 10. REQUISITION DOCUMENTS / ATTACHMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.requisition_documents (
    document_id BIGSERIAL PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    document_path TEXT NOT NULL,
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requisition_documents_requisition
        FOREIGN KEY (requisition_id)
        REFERENCES public.requisitions(requisition_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_requisition_documents_user
        FOREIGN KEY (uploaded_by)
        REFERENCES public.users(user_id)
        ON DELETE SET NULL
);

-- ============================================================
-- 11. LOGIN HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.login_history (
    login_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    ip_address VARCHAR(100),
    device VARCHAR(255),
    browser VARCHAR(255),
    success BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_login_history_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(user_id)
        ON DELETE SET NULL
);

-- ============================================================
-- 12. BUDGETS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.budgets (
    budget_id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NOT NULL,
    cost_center_id BIGINT,
    allocated_budget NUMERIC(18,2) NOT NULL DEFAULT 0,
    used_budget NUMERIC(18,2) NOT NULL DEFAULT 0,
    remaining_budget NUMERIC(18,2) NOT NULL DEFAULT 0,
    financial_year VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budgets_department
        FOREIGN KEY (department_id)
        REFERENCES public.departments(department_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_budgets_cost_center
        FOREIGN KEY (cost_center_id)
        REFERENCES public.cost_centers(cost_center_id)
        ON DELETE SET NULL,
    CONSTRAINT chk_budget_values
        CHECK (
            allocated_budget >= 0
            AND used_budget >= 0
            AND remaining_budget >= 0
        )
);

-- ============================================================
-- 13. SUPPLIER CONTACTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.supplier_contacts (
    contact_id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(30),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_supplier_contacts_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES public.suppliers(supplier_id)
        ON DELETE CASCADE
);

-- ============================================================
-- 14. APPLICATION SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.settings (
    setting_id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 15. DASHBOARD METRICS
-- Optional cache/snapshot table. Live dashboard data should
-- normally be calculated from transactional tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(18,2),
    metric_scope VARCHAR(100),
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 16. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_requisitions_status
    ON public.requisitions(status);

CREATE INDEX IF NOT EXISTS idx_requisitions_priority
    ON public.requisitions(priority);

CREATE INDEX IF NOT EXISTS idx_requisitions_created_at
    ON public.requisitions(created_at);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
    ON public.purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_requisition_comments_requisition
    ON public.requisition_comments(requisition_id);

CREATE INDEX IF NOT EXISTS idx_requisition_documents_requisition
    ON public.requisition_documents(requisition_id);

CREATE INDEX IF NOT EXISTS idx_login_history_user
    ON public.login_history(user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_department
    ON public.budgets(department_id);

CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier
    ON public.supplier_contacts(supplier_id);

-- ============================================================
-- 17. DEFAULT APPLICATION SETTINGS
-- ============================================================

INSERT INTO public.settings (setting_key, setting_value, description)
VALUES
    ('currency', 'INR', 'Default procurement currency'),
    ('financial_year', '2026-27', 'Current financial year'),
    ('company_name', 'Enterprise Procurement System', 'Application display name'),
    ('po_prefix', 'PO', 'Purchase order number prefix'),
    ('pr_prefix', 'REQ', 'Purchase requisition number prefix')
ON CONFLICT (setting_key) DO NOTHING;

COMMIT;

-- ============================================================
-- OPTIONAL VERIFICATION QUERIES
-- Run after successful migration if required.
-- ============================================================
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'requisitions'
-- ORDER BY ordinal_position;
--
-- SELECT setting_key, setting_value
-- FROM public.settings
-- ORDER BY setting_key;
