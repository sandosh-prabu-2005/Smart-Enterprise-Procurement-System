import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Download, 
  EyeOff, 
  MoreVertical 
} from 'lucide-react';

export default function EnterpriseTable({
  headers = [],
  data = [],
  itemsPerPage = 10,
  onRowClick = null,
  emptyMessage = "No records found.",
  exportFilename = "procurement_data.csv"
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  // Search, Filter, and Column Toggle states
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(
    headers.reduce((acc, h) => ({ ...acc, [h.field]: true }), {})
  );
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter logic based on global search query
  const getFilteredData = () => {
    if (!searchTerm.trim()) return data;
    
    return data.filter(row => {
      return headers.some(h => {
        let cellVal = row[h.field];
        if (h.field.includes('.')) {
          cellVal = h.field.split('.').reduce((obj, key) => (obj ? obj[key] : null), row);
        }
        if (cellVal == null) return false;
        return String(cellVal).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  const filteredData = getFilteredData();

  // Sorting logic
  const getSortedData = () => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField.includes('.')) {
        valA = sortField.split('.').reduce((obj, key) => (obj ? obj[key] : null), a);
        valB = sortField.split('.').reduce((obj, key) => (obj ? obj[key] : null), b);
      }

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  };

  const sortedData = getSortedData();
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Column toggle handler
  const toggleColumn = (field) => {
    setVisibleColumns(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const activeHeaders = headers.filter(h => visibleColumns[h.field]);

  // CSV Excel export trigger
  const exportToCSV = () => {
    const csvHeaders = activeHeaders.map(h => h.label).join(",");
    const csvRows = sortedData.map(row => {
      return activeHeaders.map(h => {
        let cellVal = row[h.field];
        if (h.field.includes('.')) {
          cellVal = h.field.split('.').reduce((obj, key) => (obj ? obj[key] : null), row);
        }
        return `"${String(cellVal || '').replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-body)' }}>
      
      {/* Enterprise Table Controls row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px', 
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderBottom: 'none',
        borderTopLeftRadius: 'var(--border-radius-card)',
        borderTopRightRadius: 'var(--border-radius-card)',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'var(--bg-color)', 
          border: '1px solid var(--border-color)',
          borderRadius: '8px', 
          padding: '6px 12px', 
          width: '260px' 
        }}>
          <Search size={16} style={{ color: '#9ca3af', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search within columns..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
          />
        </div>

        {/* Column Toggles and Export Actions */}
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          <button 
            className="btn-enterprise secondary"
            style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
            onClick={() => setShowColumnToggle(!showColumnToggle)}
          >
            <EyeOff size={16} />
            <span>Columns</span>
          </button>
          
          <button 
            className="btn-enterprise secondary"
            style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
            onClick={exportToCSV}
            disabled={sortedData.length === 0}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          {/* Column Toggle Popover */}
          {showColumnToggle && (
            <div style={{
              position: 'absolute',
              top: '42px',
              right: '90px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-hover)',
              zIndex: 100,
              padding: '12px',
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <strong style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Visible Columns</strong>
              {headers.map(h => (
                <label key={h.field} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!visibleColumns[h.field]}
                    onChange={() => toggleColumn(h.field)}
                    disabled={activeHeaders.length === 1 && visibleColumns[h.field]}
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                  <span>{h.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div style={{ flexGrow: 1, overflowX: 'auto', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 10 }}>
            <tr>
              {activeHeaders.map((h, i) => (
                <th
                  key={i}
                  onClick={() => h.sortable !== false && handleSort(h.field)}
                  style={{
                    padding: '14px 16px',
                    fontWeight: '600',
                    color: '#4b5563',
                    borderBottom: '2px solid var(--border-color)',
                    cursor: h.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    textAlign: h.align || 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: h.align === 'right' ? 'flex-end' : 'flex-start' }}>
                    {h.label}
                    {h.sortable !== false && sortField === h.field && (
                      <span style={{ fontSize: '10px', color: 'var(--primary-color)' }}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ width: '48px', borderBottom: '2px solid var(--border-color)' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeHeaders.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : 'var(--bg-color)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseOver={(e) => { if (onRowClick) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : 'var(--bg-color)'; }}
                >
                  {activeHeaders.map((h, colIndex) => {
                    let cellVal = row[h.field];
                    if (h.field.includes('.')) {
                      cellVal = h.field.split('.').reduce((obj, key) => (obj ? obj[key] : null), row);
                    }

                    return (
                      <td
                        key={colIndex}
                        style={{
                          padding: '14px 16px',
                          color: 'var(--color-black)',
                          textAlign: h.align || 'left',
                        }}
                      >
                        {h.render ? h.render(row, cellVal) : cellVal != null ? String(cellVal) : '—'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', padding: '14px 16px', color: '#9ca3af' }}>
                    <MoreVertical size={16} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          borderBottomLeftRadius: 'var(--border-radius-card)',
          borderBottomRightRadius: 'var(--border-radius-card)',
          fontSize: '13px',
          color: '#4b5563',
        }}>
          <span>
            Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * itemsPerPage, sortedData.length)}</strong> of{' '}
            <strong>{sortedData.length}</strong> entries
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: currentPage === 1 ? '#9ca3af' : '#4b5563',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: currentPage === idx + 1 ? '1px solid var(--primary-color)' : '1px solid #d1d5db',
                  backgroundColor: currentPage === idx + 1 ? 'var(--primary-color)' : '#ffffff',
                  color: currentPage === idx + 1 ? '#ffffff' : '#4b5563',
                  fontWeight: currentPage === idx + 1 ? '600' : '400',
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: currentPage === totalPages ? '#9ca3af' : '#4b5563',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
