import { login as authServiceLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [serverError, setServerError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Validate Register Number
  const validateRegisterNumber = (val) => {
    const clean = val.trim().toUpperCase();
    if (!clean) {
      return "Register number is required";
    }
    const regPattern = /^[0-9]{2,6}[A-Z]{2,5}[0-9]{2,4}$/;
    if (!regPattern.test(clean)) {
      return "Enter your valid register number (e.g. 732924CSE001)";
    }
    return "";
  };

  // Validate Password
  const validatePassword = (val) => {
    if (!val || !val.trim()) {
      return "Password is required";
    }
    return "";
  };

  const handleRegisterChange = (e) => {
    const val = e.target.value.toUpperCase();
    setRegisterNumber(val);
    if (errors.registerNumber) {
      setErrors((prev) => ({ ...prev, registerNumber: "" }));
    }
    if (serverError) setServerError("");
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    if (serverError) setServerError("");
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regErr = validateRegisterNumber(registerNumber);
    const passErr = validatePassword(password);

    if (regErr || passErr) {
      setErrors({
        registerNumber: regErr,
        password: passErr,
      });
      triggerShake();
      return;
    }

    setStatus("loading");
    setServerError("");

    try {
      await contextLogin({
        role: "student",
        identifier: registerNumber.trim().toUpperCase(),
        password: password.trim(),
        keepSignedIn,
      });

      setStatus("success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 400);
    } catch (err) {
      setStatus("error");
      setServerError(err.message || "Authentication failed. Please check your credentials.");
      triggerShake();
    }
  };

  // Framer motion variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const shakeAnimation = isShaking
    ? { x: [-8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.45 } }
    : {};

  return (
    <div className="w-full h-full bg-white p-6 sm:p-8 md:p-12 flex flex-col justify-between">
      <div>
        {/* Header: Portal badge, heading, top-right interactive button */}
        <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[#0B4A8F] block mb-1">
              STUDENT PORTAL
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Login
            </h2>
          </div>

          <button
            type="button"
            className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0B4A8F] hover:bg-[#0B4A8F] hover:text-white transition-all duration-300 shadow-sm border border-blue-100"
            title="Student Portal Access"
            aria-label="Student Portal"
          >
            <LogIn
              size={19}
              className="transition-transform duration-300 ease-out group-hover:rotate-90"
            />
          </button>
        </div>

        {/* Form */}
        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5"
          noValidate
        >
          {/* Field 1: Register Number */}
          <motion.div variants={fieldVariants}>
            <label
              htmlFor="registerNumber"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Register Number
            </label>
            <motion.div
              animate={errors.registerNumber ? shakeAnimation : {}}
              className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-slate-50/50 hover:bg-white ${
                errors.registerNumber
                  ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                  : "border-slate-200 focus-within:border-[#0B4A8F] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B4A8F]/20"
              }`}
            >
              <IdCard
                size={19}
                className={`transition-colors duration-200 shrink-0 ${
                  errors.registerNumber
                    ? "text-red-500"
                    : "text-slate-400 group-focus-within:text-[#0B4A8F]"
                }`}
              />
              <input
                id="registerNumber"
                name="registerNumber"
                type="text"
                maxLength={16}
                autoComplete="username"
                value={registerNumber}
                onChange={handleRegisterChange}
                placeholder="732924CSE001"
                aria-invalid={Boolean(errors.registerNumber)}
                aria-describedby={errors.registerNumber ? "reg-error" : undefined}
                className="w-full border-0 outline-none bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 tracking-wider font-mono uppercase"
              />
            </motion.div>
            {errors.registerNumber && (
              <p
                id="reg-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-fadeIn"
              >
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.registerNumber}</span>
              </p>
            )}
          </motion.div>

          {/* Field 2: Password */}
          <motion.div variants={fieldVariants}>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Student Password
            </label>
            <motion.div
              animate={errors.password ? shakeAnimation : {}}
              className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all duration-200 bg-slate-50/50 hover:bg-white ${
                errors.password
                  ? "border-red-400 ring-2 ring-red-100 bg-red-50/20"
                  : "border-slate-200 focus-within:border-[#0B4A8F] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B4A8F]/20"
              }`}
            >
              <Lock
                size={19}
                className={`transition-colors duration-200 shrink-0 ${
                  errors.password
                    ? "text-red-500"
                    : "text-slate-400 group-focus-within:text-[#0B4A8F]"
                }`}
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "pass-error" : undefined}
                className="w-full border-0 outline-none bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </motion.div>
            {errors.password && (
              <p
                id="pass-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-fadeIn"
              >
                <AlertCircle size={13} className="shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </motion.div>

          {/* Keep me signed in option */}
          <motion.div
            variants={fieldVariants}
            className="flex items-center justify-between pt-1"
          >
            <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-[#0B4A8F] focus:ring-[#0B4A8F] cursor-pointer accent-[#0B4A8F]"
              />
              <span>Keep me signed in on this device</span>
            </label>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ShieldCheck size={12} />
              <span>Direct Auth</span>
            </div>
          </motion.div>

          {/* Server / General Error Alert */}
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

          {/* Submit Button */}
          <motion.div variants={fieldVariants} className="pt-2">
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`relative w-full h-12 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase text-white shadow-lg shadow-blue-900/15 transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer ${
                status === "success"
                  ? "bg-emerald-600 scale-[1.01]"
                  : "bg-[#0B4A8F] hover:bg-[#083E7A] hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/25 active:scale-[0.99]"
              } disabled:cursor-not-allowed`}
            >
              {status === "loading" && (
                <div className="flex items-center gap-2 font-bold animate-pulse">
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
                <div className="flex items-center gap-2">
                  <span>LOGIN TO DASHBOARD</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </motion.div>
        </motion.form>
      </div>

      {/* Bottom public link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-8 pt-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-500"
      >
        New to TechVerse?{" "}
        <Link
          to="/technology"
          className="text-[#0B4A8F] hover:text-[#063A75] font-black hover:underline transition-colors"
        >
          Explore resources
        </Link>
      </motion.div>
    </div>
  );
}
