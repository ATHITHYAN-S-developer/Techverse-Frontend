/**
 * Certificate Service
 * Issue, retrieve, and publicly verify certificates from MongoDB API.
 */

import { apiRequest } from "./api";

const CERT_STORAGE_KEY = "techverse_certificates";

function getStoredCerts() {
  try {
    const raw = localStorage.getItem(CERT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export const certificateService = {
  async getStudentCertificates() {
    try {
      const res = await apiRequest("/certificates/my");
      const list = res?.data?.certificates || res?.certificates;
      if (Array.isArray(list)) {
        return list;
      }
    } catch (err) {
      console.debug("API certificates fetch notice:", err.message);
    }
    return getStoredCerts();
  },

  async verifyCertificate(queryId) {
    if (!queryId || !queryId.trim()) return null;
    const cleanId = queryId.trim();

    try {
      const res = await apiRequest(`/certificates/verify/${encodeURIComponent(cleanId)}`);
      if (res?.data?.certificate || res?.certificate) {
        return res?.data?.certificate || res?.certificate;
      }
    } catch (err) {
      console.debug("API verify notice:", err.message);
    }

    const certs = getStoredCerts();
    const found = certs.find(
      (c) =>
        c.certificateId?.toUpperCase() === cleanId.toUpperCase() ||
        c.verificationCode?.toUpperCase() === cleanId.toUpperCase() ||
        c.id?.toUpperCase() === cleanId.toUpperCase()
    );
    return found || null;
  },

  async generateCertificate(user, course, score) {
    try {
      const courseId = course._id || course.id || course.slug;
      const res = await apiRequest("/certificates/claim", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      });
      if (res?.data?.certificate || res?.certificate) {
        return res?.data?.certificate || res?.certificate;
      }
    } catch (err) {
      console.debug("Backend certificate claim note:", err.message);
    }

    // Local state fallback for client offline storage
    const certs = getStoredCerts();
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const serial = String(certs.length + 1).padStart(4, "0");
    const certId = `VCET-CERT-2026-${(course.title || "CRS").substring(0, 3).toUpperCase()}-${serial}`;

    const newCert = {
      id: certId,
      certificateId: certId,
      verificationCode: `0x${randomHex}`,
      studentName: user?.name || "Student",
      registerNumber: user?.registerNumber || "VCET-STU",
      department: user?.department || "Computer Science & Engineering",
      courseId: course.id || course._id,
      courseName: course.title,
      instructor: course.instructor || "VCET Faculty Lead",
      score: score || 85,
      grade: score >= 90 ? "Outstanding" : score >= 75 ? "Distinction" : "First Class",
      issuedDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      status: "Verified",
    };

    certs.unshift(newCert);
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));
    return newCert;
  },
};

export default certificateService;
