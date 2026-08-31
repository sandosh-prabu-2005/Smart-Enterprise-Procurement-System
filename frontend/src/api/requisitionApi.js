import apiClient from '../api'; // Imports the secure Axios instance we created

/**
 * Fetches the main details of a specific requisition.
 * Matches backend: RequisitionController.java -> @GetMapping("/{id}")
 */
export const getRequisitionById = async (id) => {
  const response = await apiClient.get(`/requisitions/${id}`);
  return response.data;
};

/**
 * Fetches the chronological history/audit trail for a specific requisition.
 * The backend has no "history by requisition id" route (only GET /requisition-history
 * for everything, or GET /requisition-history/{historyId} for one record), so we fetch
 * all history and filter client-side by requisition.requisitionId.
 */
export const getRequisitionHistory = async (id) => {
  const response = await apiClient.get(`/requisitions/${id}/timeline`);
  return response.data;
};

/**
 * Fetches the line items (requested products/quantities) for a specific requisition.
 * Same situation as history: no filtered backend route, filter client-side.
 */
export const getRequisitionLineItems = async (id) => {
  const response = await apiClient.get('/requisition-line-items');
  const all = response.data || [];
  return all.filter((item) => item.requisition?.requisitionId === Number(id));
};