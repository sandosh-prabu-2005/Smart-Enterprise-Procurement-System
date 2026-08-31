const API_BASE = 'http://localhost:8080/api';

async function apiCall(endpoint, method, token, body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return await res.json();
}

async function investigate() {
  const admin = await login('admin', 'admin123');
  const allReqs = await apiCall('/requisitions', 'GET', admin.accessToken);
  const legacyReq = allReqs.find(r => r.requisitionNumber === 'REQ-20260809085128-9054');
  console.log("Legacy Requisition:");
  console.log(JSON.stringify(legacyReq, null, 2));

  // Find other legacy requisitions
  const legacyReqs = allReqs.filter(r => r.supplier === null);
  console.log("Total requisitions with null supplier:", legacyReqs.length);
  legacyReqs.forEach(r => {
    console.log(`ID: ${r.requisitionId}, Number: ${r.requisitionNumber}, Status: ${r.status}`);
  });
}
investigate();
