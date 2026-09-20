/**
 * Certificate PDF Generator
 * Uses the custom VCET Gold & Navy certificate template as the background
 * and draws crisp dynamic student + course credentials on top.
 */

import { jsPDF } from "jspdf";
import certTemplateImg from "../assets/certificate-template.png";

/**
 * Load image as an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Render the complete certificate on an HTML5 Canvas with dynamic student details
 */
export async function renderCertificateCanvas(certData) {
  const bgImg = await loadImage(certTemplateImg);

  const canvas = document.createElement("canvas");
  canvas.width = bgImg.naturalWidth || 2000;
  canvas.height = bgImg.naturalHeight || 1414;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // 1. Draw Template Background
  ctx.drawImage(bgImg, 0, 0, W, H);

  // Dynamic Content Coordinates (Centered in the right clear pane)
  // The left medal takes ~32% width, the top header takes ~28% height
  const contentCenterX = W * 0.61;

  // 2. Certificate Category Title
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const isModuleAppreciation = certData.type === "module_appreciation" || Boolean(certData.moduleTitle);
  const certHeader = isModuleAppreciation ? "CERTIFICATE OF APPRECIATION" : "CERTIFICATE OF COMPLETION";

  ctx.fillStyle = "#0B4A8F";
  ctx.font = "bold 44px 'Plus Jakarta Sans', 'Inter', sans-serif";
  ctx.fillText(certHeader, contentCenterX, H * 0.38);

  ctx.fillStyle = "#64748B";
  ctx.font = "italic 24px 'Plus Jakarta Sans', 'Inter', sans-serif";
  ctx.fillText("This certificate is proudly presented to", contentCenterX, H * 0.44);

  // 3. Recipient Student Name (Large Bold Navy)
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 58px 'Plus Jakarta Sans', 'Inter', sans-serif";
  const studentName = certData.studentName || "VCET Engineering Scholar";
  ctx.fillText(studentName.toUpperCase(), contentCenterX, H * 0.52);

  // Thin underline accent
  ctx.strokeStyle = "#D97706"; // Amber Gold
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(contentCenterX - 220, H * 0.56);
  ctx.lineTo(contentCenterX + 220, H * 0.56);
  ctx.stroke();

  // Register Number & Dept
  ctx.fillStyle = "#475569";
  ctx.font = "600 20px 'Plus Jakarta Sans', 'Inter', sans-serif";
  const regNo = certData.registerNumber ? `Reg No: ${certData.registerNumber} • ` : "";
  const dept = certData.department || "Department of Computer Science & Engineering";
  ctx.fillText(`${regNo}${dept}`, contentCenterX, H * 0.59);

  // 4. Achievement Description
  ctx.fillStyle = "#334155";
  ctx.font = "normal 22px 'Plus Jakarta Sans', 'Inter', sans-serif";
  const score = certData.score ? `${certData.score}%` : "100%";
  const moduleName = certData.moduleTitle || certData.title || "";
  const courseName = certData.courseName || "Educational Technology";

  if (isModuleAppreciation && moduleName) {
    ctx.fillText(
      `in recognition of successfully completing ${moduleName} with a score of ${score}`,
      contentCenterX,
      H * 0.65
    );
    ctx.fillStyle = "#0B4A8F";
    ctx.font = "bold 34px 'Plus Jakarta Sans', 'Inter', sans-serif";
    ctx.fillText(courseName, contentCenterX, H * 0.72);
  } else {
    ctx.fillText(
      "for successfully completing all curriculum modules, assessments, and projects in",
      contentCenterX,
      H * 0.65
    );
    ctx.fillStyle = "#0B4A8F";
    ctx.font = "bold 38px 'Plus Jakarta Sans', 'Inter', sans-serif";
    ctx.fillText(courseName, contentCenterX, H * 0.72);
  }

  // 6. Score & Grade Badge
  const grade = certData.grade || (Number(certData.score) >= 85 ? "Distinction" : "Pass");
  ctx.fillStyle = "#047857"; // Emerald Green
  ctx.font = "bold 20px 'Plus Jakarta Sans', 'Inter', sans-serif";
  ctx.fillText(`Assessment Score: ${score} (${grade})`, contentCenterX, H * 0.77);

  // 7. Footer Metadata (Left: ID & Hash, Right: Authorized Signatures)
  const leftX = W * 0.36;
  const rightX = W * 0.86;
  const footerY = H * 0.87;

  // Left: Verification IDs
  ctx.textAlign = "left";
  ctx.fillStyle = "#64748B";
  ctx.font = "500 16px 'Courier New', monospace";
  const displayCertId = certData.certificateNumber || certData.certificateId || certData.id || "VCET-CERT-2026-001";
  ctx.fillText(`Certificate ID: ${displayCertId}`, leftX, footerY);
  ctx.fillText(`Verification Hash: ${certData.verificationCode || "0x89FA9B432E"}`, leftX, footerY + 24);

  ctx.font = "500 16px 'Plus Jakarta Sans', sans-serif";
  const rawDate = certData.issuedDate || certData.issuedAt;
  const issueDate = rawDate ? new Date(rawDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  ctx.fillText(`Issued: ${issueDate}`, leftX, footerY + 48);

  // Right: Signatures
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
  const instructor = certData.instructor || certData.instructorName || "Prof. S. R. Murugesan";
  ctx.fillText(instructor, rightX, footerY);

  ctx.fillStyle = "#64748B";
  ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Course Coordinator", rightX, footerY + 20);

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 18px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Dr. M. Jayaraman", rightX, footerY + 44);

  ctx.fillStyle = "#64748B";
  ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Principal / Head of Institution", rightX, footerY + 64);

  return canvas;
}

/**
 * Generate a PDF and trigger instant browser download
 */
export async function downloadCertificatePdf(certData) {
  const canvas = await renderCertificateCanvas(certData);
  const imgData = canvas.toDataURL("image/png", 1.0);

  // A4 Landscape is 297mm x 210mm
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

  const cleanStudent = (certData.studentName || "Student").replace(/[^a-zA-Z0-9]+/g, "_");
  const cleanCourse = (certData.courseName || certData.title || "Course").replace(/[^a-zA-Z0-9]+/g, "_");
  const fileName = `VCET_Certificate_${cleanStudent}_${cleanCourse}.pdf`;

  pdf.save(fileName);
  return fileName;
}

/**
 * Generate a high-res image data URL for instant modal preview
 */
export async function getCertificatePreviewDataUrl(certData) {
  const canvas = await renderCertificateCanvas(certData);
  return canvas.toDataURL("image/png", 0.95);
}
