import React, { useState } from 'react';

export default function ReviewList({ reviews }) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  if (!reviews || reviews.length === 0) {
    return <div style={{ textAlign: 'center', color: '#718096', fontSize: 18, margin: '40px 0' }}>No reviews yet</div>;
  }

  const totalPages = Math.ceil(reviews.length / pageSize);
  const paginatedReviews = reviews.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {paginatedReviews.map((r, idx) => (
          <div key={idx} style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: 24,
            border: '1px solid #e2e8f0',
            position: 'relative',
            fontFamily: 'monospace',
            fontSize: 15,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: 220
          }}>
            <pre style={{
              margin: 0,
              background: 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)',
              padding: '12px 16px',
              borderRadius: '8px',
              maxHeight: '250px',
              overflow: 'auto',
              fontSize: 15,
              lineHeight: 1.6,
              boxShadow: '0 1px 4px rgba(49,130,206,0.10)',
              border: '1px solid #bbdefb',
              color: '#263238',
              wordBreak: 'break-word'
            }} dangerouslySetInnerHTML={{__html: syntaxHighlight(r)}} />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ marginRight: 12, padding: '8px 16px', fontSize: 16, borderRadius: 6, border: '1px solid #3182ce', background: page === 1 ? '#e2e8f0' : '#3182ce', color: page === 1 ? '#718096' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >Prev</button>
          <span style={{ fontSize: 16, fontWeight: 500, margin: '0 8px' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ marginLeft: 12, padding: '8px 16px', fontSize: 16, borderRadius: 6, border: '1px solid #3182ce', background: page === totalPages ? '#e2e8f0' : '#3182ce', color: page === totalPages ? '#718096' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >Next</button>
        </div>
      )}
    </>
  );
}

// Syntax highlight function for JSON
function syntaxHighlight(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\w+)": )?("[^"]*"|\d+|true|false|null)/g, function(match, p1, p2, p3) {
    let keyColor = '#1976d2';
    let stringColor = '#43a047';
    let numberColor = '#e65100';
    let booleanColor = '#d84315';
    let nullColor = '#6d4c41';
    if (p1) {
      return `<span style=\"color:${keyColor};font-weight:bold\">${p1}</span>` +
        (p3[0] === '"'
          ? `<span style=\"color:${stringColor}\">${p3}</span>`
          : p3 === 'true' || p3 === 'false'
            ? `<span style=\"color:${booleanColor};font-weight:bold\">${p3}</span>`
            : p3 === 'null'
              ? `<span style=\"color:${nullColor};font-style:italic\">${p3}</span>`
              : `<span style=\"color:${numberColor}\">${p3}</span>`);
    } else {
      return match;
    }
  });
}
