/* eslint-disable react-refresh/only-export-components -- this file
   intentionally exports shared status constants/helpers alongside the
   StatusBadge component itself; splitting it into separate files isn't
   worth it for a single small utility file with one consumer. */

export const STATUS_LABELS = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ORDER_CREATED: 'Purchase Order Created',
  DELIVERED: 'Delivered',
  DRAFT: 'Draft',
  RECEIVED: 'Delivered',
  PARTIALLY_DELIVERED: 'Partially Delivered',
  FULLY_DELIVERED: 'Delivered'
};

export const STATUS_COLORS = {
  PENDING_APPROVAL: { dot: '🟡', bg: '#fffbeb', border: '#fef3c7', text: '#F59E0B' },
  APPROVED: { dot: '🟢', bg: '#ecfdf5', border: '#d1fae5', text: '#16A34A' },
  REJECTED: { dot: '🔴', bg: '#fef2f2', border: '#fee2e2', text: '#DC2626' },
  ORDER_CREATED: { dot: '🔵', bg: '#eff6ff', border: '#dbeafe', text: '#2563EB' },
  DELIVERED: { dot: '🟢', bg: '#ecfdf5', border: '#d1fae5', text: '#16A34A' },
  DRAFT: { dot: '⚪', bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
  RECEIVED: { dot: '🟢', bg: '#ecfdf5', border: '#d1fae5', text: '#16A34A' },
  PARTIALLY_DELIVERED: { dot: '🟡', bg: '#fffbeb', border: '#fef3c7', text: '#F59E0B' },
  FULLY_DELIVERED: { dot: '🟢', bg: '#ecfdf5', border: '#d1fae5', text: '#16A34A' }
};

export function renderStatusBadge(status) {
  const normalized = String(status || 'DRAFT').toUpperCase();
  const config = STATUS_COLORS[normalized] || STATUS_COLORS.DRAFT;
  const label = STATUS_LABELS[normalized] || normalized;

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        whiteSpace: 'nowrap'
      }}
    >
      <span>{config.dot}</span>
      <span>{label}</span>
    </span>
  );
}

export default function StatusBadge({ status }) {
  return renderStatusBadge(status);
}