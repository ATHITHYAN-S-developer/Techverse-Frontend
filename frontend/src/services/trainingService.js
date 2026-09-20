import { api } from "./api";

export const trainingService = {
  async getOverview() {
    try {
      const res = await api.get("/training/overview");
      return {
        tracks: res?.tracks || [],
        bootcamps: res?.bootcamps || [],
        companies: res?.companies || [],
        toolkits: res?.toolkits || [],
      };
    } catch (e) {
      console.warn("Could not fetch training overview:", e);
      return { tracks: [], bootcamps: [], companies: [], toolkits: [] };
    }
  },

  async getCompanies() {
    try {
      const res = await api.get("/training/companies");
      return res?.companies || [];
    } catch (e) {
      console.warn("Could not fetch companies:", e);
      return [];
    }
  },

  async getCompanyBySlug(slug) {
    try {
      const res = await api.get(`/training/companies/${slug}`);
      return res?.company || null;
    } catch (e) {
      console.warn("Could not fetch company details:", e);
      return null;
    }
  },

  async getAptitudeCategories() {
    try {
      const res = await api.get("/training/aptitude");
      return res?.categories || [];
    } catch (e) {
      console.warn("Could not fetch aptitude categories:", e);
      return [];
    }
  },
};
