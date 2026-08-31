-- The Invoice and Payment entities (and their controllers/services) exist
-- in the Java codebase, but no migration ever created their tables.
-- This is why GET /api/invoices and GET /api/payments both return
-- 500 "relation does not exist" errors, and why uploading an invoice fails.

CREATE TABLE IF NOT EXISTS public.invoices (
    invoice_id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    po_id BIGINT NOT NULL,
    invoice_date DATE,
    amount NUMERIC(12,2) NOT NULL,
    gst_amount NUMERIC(12,2),
    upload_url VARCHAR(500),
    status VARCHAR(30) DEFAULT 'PENDING',
    verified_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_po
        FOREIGN KEY (po_id) REFERENCES public.purchase_orders(po_id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_verified_by
        FOREIGN KEY (verified_by) REFERENCES public.users(user_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
    payment_id BIGSERIAL PRIMARY KEY,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    invoice_id BIGINT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_date TIMESTAMP,
    status VARCHAR(30) DEFAULT 'COMPLETED',
    paid_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_paid_by
        FOREIGN KEY (paid_by) REFERENCES public.users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_po_id ON public.invoices(po_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
