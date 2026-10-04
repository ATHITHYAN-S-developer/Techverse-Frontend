/**
 * Training & Company Blueprint Service
 * Communicates with /api/training backend endpoints.
 */

import { apiRequest } from "./api";

export const trainingService = {
  // Overview
  async getOverview() {
    return apiRequest("/training/overview");
  },

  // Companies
  async getCompanies() {
    return apiRequest("/training/companies");
  },

  async getCompanyBySlug(slug) {
    return apiRequest(`/training/companies/${slug}`);
  },

  async createCompany(data) {
    return apiRequest("/training/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCompany(id, data) {
    return apiRequest(`/training/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCompany(id) {
    return apiRequest(`/training/companies/${id}`, {
      method: "DELETE",
    });
  },

  // Bootcamps
  async createBootcamp(data) {
    return apiRequest("/training/bootcamps", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateBootcamp(id, data) {
    return apiRequest(`/training/bootcamps/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteBootcamp(id) {
    return apiRequest(`/training/bootcamps/${id}`, {
      method: "DELETE",
    });
  },

  // Toolkits
  async createToolkit(data) {
    return apiRequest("/training/toolkits", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateToolkit(id, data) {
    return apiRequest(`/training/toolkits/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteToolkit(id) {
    return apiRequest(`/training/toolkits/${id}`, {
      method: "DELETE",
    });
  },
};
