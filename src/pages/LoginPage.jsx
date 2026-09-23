import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  IdCard,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  UserCheck,
  EyeIcon,
} from "lucide-react";
import { getCurrentUser, isAuthenticated } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import loginIllustration from "../assets/login-illustration.jpg";
import campusBg from "../assets/college/campus-aerial-bw.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  // Active Role: "student" | "faculty" | "admin"
  const [activeRole, setActiveRole] = useState("student");

  // Student Form Fields
  const [studentReg, setStudentReg] = useState("");
  const [studentDob, setStudentDob] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Faculty Form Fields
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");
  const [showFacultyPassword, setShowFacultyPassword] = useState(false);

  // Admin Form Fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success"
  const [serverError, setServerError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const u = getCurrentUser();
      if (u?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (u?.role === "faculty" || u?.role === "teacher") {
        navigate("/faculty/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrors({});
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (activeRole === "student") {
      const cleanReg = studentReg.trim().toUpperCase();
      const cleanDob = studentDob.trim();

      const regPattern = /^[0-9]{2,6}[A-Z]{2,5}[0-9]{2,4}$/;
      const newErrors = {};

      if (!cleanReg) {
        newErrors.studentReg = "Register number is required";
      } else if (!regPattern.test(cleanReg)) {
        newErrors.studentReg = "Enter a valid register number (e.g. 732924ECE001)";
      }

      if (!cleanDob) {
        newErrors.studentDob = "Password / Date of birth is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        triggerShake();
        return;
      }

      setStatus("loading");
      try {
        await contextLogin({
          role: "student",
          identifier: cleanReg,
          password: cleanDob,
          rememberMe,
        });
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 400);
      } catch (err) {
        setStatus("idle");
        setServerError(err.message || "Failed to sign in as student.");
        triggerShake();
      }
    } else if (activeRole === "faculty") {
      const cleanEmail = facultyEmail.trim();
      const cleanPass = facultyPassword.trim();
      const newErrors = {};

      if (!cleanEmail) {
        newErrors.facultyEmail = "Staff Email / Faculty ID is required";
      }
      if (!cleanPass) {
        newErrors.facultyPassword = "Password is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        triggerShake();
        return;
      }

      setStatus("loading");
      try {
        await contextLogin({
          role: "teacher",
          identifier: cleanEmail,
          password: cleanPass,
          rememberMe,
        });
        setStatus("success");
        setTimeout(() => navigate("/faculty/dashboard"), 400);
      } catch (err) {
        setStatus("idle");
        setServerError(err.message || "Failed to sign in as faculty.");
        triggerShake();
      }
    } else if (activeRole === "admin") {
      const cleanAdmin = adminUsername.trim();
      const cleanPass = adminPassword.trim();
      const newErrors = {};

      if (!cleanAdmin) {
        newErrors.adminUsername = "Admin username or email is required";
      }
      if (!cleanPass) {
        newErrors.adminPassword = "Admin password / Security key is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        triggerShake();
        return;
      }

      setStatus("loading");
      try {
        await contextLogin({
          role: "admin",
          identifier: cleanAdmin,
          password: cleanPass,
          rememberMe,
        });
        setStatus("success");
        setTimeout(() => navigate("/admin/dashboard"), 400);
      } catch (err) {
        setStatus("idle");
        setServerError(err.message || "Failed to sign in as administrator.");
        triggerShake();
      }
    }
  };

  const roles = [
    {
      id: "student",
      label: "Students",
      icon: GraduationCap,
      badge: "STUDENT PORTAL",
    },
    {
      id: "faculty",
      label: "Teachers",
      icon: BookOpen,
      badge: "FACULTY WORKSPACE",
    },
    {
      id: "admin",
      label: "Admin",
      icon: ShieldCheck,
      badge: "ADMINISTRATIVE CONTROL CENTER",
    },
  ];

  const shakeAnimation = isShaking
    ? {
        x: [-8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.4 },
      }
    : {};

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden selection:bg-[#0062A8] selection:text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full md:w-[52%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-white relative overflow-hidden"
      >
        {/* Campus Background Image Overlay (Light Watermark for Maximum Readability) */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.18] pointer-events-none filter contrast-110 grayscale"

          style={{ backgroundImage: `url(${campusBg})` }}
        />
        <div className="absolute inset-0 bg-[#FAFAFC]/40 pointer-events-none" />
        {/* Header: Logo & Back Link */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 md:mb-4">
          <Link to="/" className="inline-flex items-center gap-2.5 select-none group">
            <div className="h-10 w-10 rounded-xl bg-[#0062A8] text-white flex items-center justify-center font-black text-lg shadow-xs shadow-[#0062A8]/20 transition-transform group-hover:scale-105">
              <Sparkles size={19} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#0062A8] leading-tight">
                Tech<span className="text-[#0062A8]">Verse</span>
              </span>
              <span className="text-[10px] font-bold text-[#0062A8] tracking-wider uppercase">
                VCET TECH HUB
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062A8] hover:text-[#0062A8] transition-colors px-3 py-1.5 rounded-full bg-gray-50 hover:bg-blue-50 border border-gray-200/60"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Center Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Welcome Heading */}
          <motion.div variants={itemVariants} className="mb-5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0062A8]">
              {roles.find((r) => r.id === activeRole)?.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0062A8] tracking-tight mt-1">
              Welcome Back
            </h1>
            <p className="text-sm text-[#0062A8] mt-1.5 font-normal">
              Please choose your role and enter your institutional credentials.
            </p>
          </motion.div>

          {/* 3-Role Tab Switcher (Students / Teachers / Admin) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100/90 rounded-2xl mb-6 border border-gray-200/60"
          >
            {roles.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-[#0062A8] shadow-xs font-black border border-gray-200/50 scale-[1.02]"
                      : "text-[#0062A8] hover:text-[#0B4A8F] font-semibold"

                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#0062A8]" : "text-slate-500"} />
                  <span className="text-xs mt-1 truncate max-w-full">{role.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Role-Specific Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* 1. STUDENT LOGIN FORM */}
            {activeRole === "student" && (
              <>
                {/* Register Number */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="studentReg"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0062A8] mb-1.5"
                  >
                    REGISTER NUMBER
                  </label>
                  <motion.div
                    animate={errors.studentReg ? shakeAnimation : {}}
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-gray-50/70 hover:bg-white ${
                      errors.studentReg
                        ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                        : "border-gray-300 focus-within:border-[#0062A8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0062A8]/20"
                    }`}
                  >
                    <IdCard
                      size={19}
                      className={`transition-colors shrink-0 ${
                        errors.studentReg ? "text-red-500" : "text-slate-500 group-focus-within:text-[#0062A8]"
                      }`}
                    />
                    <input
                      id="studentReg"
                      name="studentReg"
                      type="text"
                      maxLength={16}
                      autoComplete="username"
                      value={studentReg}
                      onChange={(e) => {
                        setStudentReg(e.target.value.toUpperCase());
                        if (errors.studentReg) setErrors((prev) => ({ ...prev, studentReg: "" }));
                      }}
                      placeholder="732924ECE001"
                      className="w-full border-0 outline-none bg-transparent text-sm font-semibold text-[#0062A8] placeholder:text-[#0062A8] tracking-wider font-mono uppercase"
                    />
                  </motion.div>
                  {errors.studentReg && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errors.studentReg}</span>
                    </p>
                  )}
                </motion.div>

                {/* Password / Date of Birth */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="studentDob"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0062A8]"
                    >
                      PASSWORD / DATE OF BIRTH
                    </label>
                    <span className="text-[11px] text-[#0062A8] font-medium">e.g. student123</span>
                  </div>
                  <motion.div
                    animate={errors.studentDob ? shakeAnimation : {}}
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-gray-50/70 hover:bg-white ${
                      errors.studentDob
                        ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                        : "border-gray-300 focus-within:border-[#0062A8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0062A8]/20"
                    }`}
                  >
                    <Lock
                      size={19}
                      className={`transition-colors shrink-0 ${
                        errors.studentDob ? "text-red-500" : "text-slate-500 group-focus-within:text-[#0062A8]"
                      }`}
                    />
                    <input
                      id="studentDob"
                      name="studentDob"
                      type={showStudentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={studentDob}
                      onChange={(e) => {
                        setStudentDob(e.target.value);
                        if (errors.studentDob) setErrors((prev) => ({ ...prev, studentDob: "" }));
                      }}
                      placeholder="student123 or YYYY-MM-DD"
                      className="w-full border-0 outline-none bg-transparent text-sm font-medium text-[#0062A8] placeholder:text-[#0062A8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="text-slate-500 hover:text-slate-700 focus:outline-none p-0.5 rounded cursor-pointer"
                      tabIndex={-1}
                    >
                      {showStudentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </motion.div>
                  {errors.studentDob && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errors.studentDob}</span>
                    </p>
                  )}
                </motion.div>
              </>
            )}

            {/* 2. FACULTY / TEACHER LOGIN FORM */}
            {activeRole === "faculty" && (
              <>
                {/* Staff Email / ID */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="facultyEmail"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0062A8] mb-1.5"
                  >
                    FACULTY EMAIL / STAFF ID
                  </label>
                  <motion.div
                    animate={errors.facultyEmail ? shakeAnimation : {}}
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-gray-50/70 hover:bg-white ${
                      errors.facultyEmail
                        ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                        : "border-gray-300 focus-within:border-[#0062A8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0062A8]/20"
                    }`}
                  >
                    <Mail
                      size={19}
                      className={`transition-colors shrink-0 ${
                        errors.facultyEmail ? "text-red-500" : "text-slate-500 group-focus-within:text-[#0062A8]"
                      }`}
                    />
                    <input
                      id="facultyEmail"
                      name="facultyEmail"
                      type="text"
                      autoComplete="username"
                      value={facultyEmail}
                      onChange={(e) => {
                        setFacultyEmail(e.target.value);
                        if (errors.facultyEmail) setErrors((prev) => ({ ...prev, facultyEmail: "" }));
                      }}
                      placeholder="faculty.cse@vcet.ac.in"
                      className="w-full border-0 outline-none bg-transparent text-sm font-semibold text-[#0062A8] placeholder:text-[#0062A8]"
                    />
                  </motion.div>
                  {errors.facultyEmail && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errors.facultyEmail}</span>
                    </p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <label
                    htmlFor="facultyPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0062A8] mb-1.5"
                  >
                    FACULTY PASSWORD
                  </label>
                  <motion.div
                    animate={errors.facultyPassword ? shakeAnimation : {}}
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-gray-50/70 hover:bg-white ${
                      errors.facultyPassword
                        ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                        : "border-gray-300 focus-within:border-[#0062A8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0062A8]/20"
                    }`}
                  >
                    <Lock
                      size={19}
                      className={`transition-colors shrink-0 ${
                        errors.facultyPassword ? "text-red-500" : "text-slate-500 group-focus-within:text-[#0062A8]"
                      }`}
                    />
                    <input
                      id="facultyPassword"
                      name="facultyPassword"
                      type={showFacultyPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={facultyPassword}
                      onChange={(e) => {
                        setFacultyPassword(e.target.value);
                        if (errors.facultyPassword) setErrors((prev) => ({ ...prev, facultyPassword: "" }));
                      }}
                      placeholder="••••••••"
                      className="w-full border-0 outline-none bg-transparent text-sm font-medium text-[#0062A8] placeholder:text-[#0062A8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFacultyPassword((prev) => !prev)}
                      className="text-slate-500 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      {showFacultyPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </motion.div>
                  {errors.facultyPassword && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errors.facultyPassword}</span>
                    </p>
                  )}
                </motion.div>
              </>
            )}

            {/* 3. ADMIN LOGIN FORM */}
            {activeRole === "admin" && (
              <>
                {/* Admin ID */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="adminUsername"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0062A8] mb-1.5"
                  >
                    ADMIN ACCOUNT / USERNAME
                  </label>
                  <motion.div
                    animate={errors.adminUsername ? shakeAnimation : {}}
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-gray-50/70 hover:bg-white ${
                      errors.adminUsername
                        ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                        : "border-gray-300 focus-within:border-[#0062A8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0062A8]/20"
                    }`}
                  >
                    <UserCheck
                      size={19}
                      className={`transition-colors shrink-0 ${
                        errors.adminUsername ? "text-red-500" : "text-slate-500 group-focus-within:text-[#0062A8]"
                      }`}
                    />
                    <input
                      id="adminUsername"
                      name="adminUsername"
                      type="text"
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => {
                        setAdminUsername(e.target.value);
                        if (errors.adminUsername) setErrors((prev) => ({ ...prev, adminUsername: "" }));
                      }}
                      placeholder="admin@vcet.ac.in"
                      className="w-full border-0 outline-none bg-transparent text-sm font-semibold text-[#0062A8] placeholder:text-[#0062A8]"
                    />
                  </motion.div>
                  {errors.adminUsername && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errors.adminUsername}</span>
                    </p>
                  )}
                </motion.div>

                {/* Admin Password / Security Key */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <label
                    htmlFor="adminPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-[#0062A8] mb-1.5"
                  >
                    ADMIN SECURITY KEY / PASSCODE
                  </label>
                  <motion.div
                    animate={errors.adminPassword ? shakeAnimation : {}}
                    className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-gray-50/70 hover:bg-white ${
                      errors.adminPassword
                        ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                        : "border-gray-300 focus-within:border-[#0062A8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0062A8]/20"
                    }`}
                  >
                    <Lock
                      size={19}
                      className={`transition-colors shrink-0 ${
                        errors.adminPassword ? "text-red-500" : "text-slate-500 group-focus-within:text-[#0062A8]"
                      }`}
                    />
                    <input
                      id="adminPassword"
                      name="adminPassword"
                      type={showAdminPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (errors.adminPassword) setErrors((prev) => ({ ...prev, adminPassword: "" }));
                      }}
                      placeholder="••••••••••••"
                      className="w-full border-0 outline-none bg-transparent text-sm font-medium text-[#0062A8] placeholder:text-[#0062A8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((prev) => !prev)}
                      className="text-slate-500 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </motion.div>
                  {errors.adminPassword && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errors.adminPassword}</span>
                    </p>
                  )}
                </motion.div>
              </>
            )}

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-[#0062A8]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#0062A8] focus:ring-[#0062A8] accent-[#0062A8] cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#0062A8] bg-[#E8F3FB] px-2 py-0.5 rounded-md border border-[#BBD9EE]">
                <ShieldCheck size={12} className="text-[#0062A8]" />
                <span>
                  {activeRole === "student"
                    ? "Student Auth"
                    : activeRole === "faculty"
                    ? "Faculty Auth"
                    : "Admin Auth"}
                </span>
              </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2"
                >
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{serverError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`relative w-full h-12 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase text-white shadow-md shadow-blue-900/15 transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer ${
                  status === "success"
                    ? "bg-emerald-600 scale-[1.01]"
                    : "bg-[#0062A8] hover:bg-[#00508a] hover:scale-[1.01] hover:shadow-lg hover:shadow-[#0062A8]/25 active:scale-[0.99]"
                } disabled:cursor-not-allowed`}
              >
                {status === "loading" && (
                  <div className="flex items-center gap-2 font-bold">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                )}

                {status === "success" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 font-bold"
                  >
                    <Check size={20} className="stroke-[3]" />
                    <span>Authenticated! Entering Dashboard...</span>
                  </motion.div>
                )}

                {status !== "loading" && status !== "success" && (
                  <div className="flex items-center gap-2 font-black">
                    <span>
                      {activeRole === "student"
                        ? "SIGN IN AS STUDENT"
                        : activeRole === "faculty"
                        ? "SIGN IN AS FACULTY"
                        : "SIGN IN AS ADMINISTRATOR"}
                    </span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Explore Link */}
          <div className="text-center mt-6 text-xs text-[#0062A8] font-normal">
            New to TechVerse?{" "}
            <Link to="/technology" className="font-bold text-[#0062A8] hover:underline">
              Explore Resources
            </Link>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-xs text-[#0062A8] text-center md:text-left mt-4">
          © {new Date().getFullYear()} Velalar College of Engineering and Technology (Autonomous).
        </div>
      </motion.div>

      {/* 2. RIGHT PANEL: Deep VCET Blue Background (#0062A8) with Framed Illustration Card (48% Width) */}
      <div className="w-full md:w-[48%] bg-[#0062A8] flex flex-col justify-between p-8 sm:p-12 lg:p-14 min-h-[380px] md:min-h-screen relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

        <div className="max-w-lg w-full mx-auto my-auto flex flex-col items-center justify-center text-center relative z-10">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-2xl overflow-hidden shadow-2xl bg-[#004f87]/50 border border-white/15 p-4 sm:p-6 backdrop-blur-xs"
          >
            <img
              src={loginIllustration}
              alt="VCET TechVerse Portal"
              className="w-full h-auto object-contain rounded-xl drop-shadow-md"
            />
          </motion.div>

          <motion.div
            key={`${activeRole}-desc`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-7 text-white max-w-md"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={13} className="text-blue-200" />
              <span>
                {activeRole === "student"
                  ? "VCET TECHVERSE STUDENT HUB"
                  : activeRole === "faculty"
                  ? "VCET FACULTY TEACHING HUB"
                  : "VCET ADMIN MANAGEMENT CONSOLE"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              {activeRole === "student"
                ? "Access curated technology stacks, placement aptitude training, GATE modules, and department updates."
                : activeRole === "faculty"
                ? "Manage course e-resources, post student assignments, track department metrics, and publish updates."
                : "Manage institutional platform configurations, verify user privileges, and inspect learning analytics."}
            </p>
          </motion.div>
        </div>

        {/* Bottom Visitors Badge */}
        <div className="relative z-10 flex justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
            <EyeIcon size={13} />
            <span>1,273 VISITORS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
