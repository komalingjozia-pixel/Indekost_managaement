import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiHome,
  FiLock,
  FiShield,
  FiDatabase,
  FiBarChart2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import axiosInstance from "../api/axiosInstance.js";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { validateLoginForm } from "../utils/validators.js";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateLoginForm(form);
    setErrors(validation.errors);

    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/auth/login", form);

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("admin", JSON.stringify(data.data.admin));

      toast.success("Login berhasil");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#1E293B]">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#2563EB]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#14B8A6]/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-screen flex-col justify-between bg-[#0F172A] px-12 py-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] shadow-lg shadow-blue-500/20">
                <FiHome className="text-xl" />
              </div>

              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  SIM Kost Indekos
                </h1>
                <p className="text-xs text-slate-400">
                  Sistem Informasi Manajemen
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
                Panel Admin Indekos
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                Kelola data indekos dengan lebih rapi dan terstruktur.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
                Sistem ini membantu admin mengelola data kamar, penghuni,
                pembayaran, dan laporan bulanan tanpa pencatatan manual.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-lg">
                <FiHome className="text-xl" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">
                SIM Kost Indekos
              </h1>
              <p className="mt-2 text-sm text-[#64748B]">
                Masuk ke panel administrator
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
              <div className="mb-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <FiLock className="text-lg" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[#1E293B]">
                  Masuk Admin
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  Gunakan akun administrator untuk mengakses dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="username"
                  label="Username"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  error={errors.username}
                />

                {/* Custom password field with show/hide icon */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-[#1E293B]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm outline-none transition focus:border-blue-500 ${
                        errors.password ? "border-red-500" : "border-slate-200"
                      }`}
                      placeholder="Masukkan password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Lihat password"
                      }
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full justify-center gap-2 rounded-2xl py-3 text-sm font-semibold shadow-lg shadow-blue-500/20"
                  disabled={loading}
                >
                  <FiLock />
                  {loading ? "Memproses..." : "Masuk ke Dashboard"}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-[#64748B]">
              © 2026 SIM Kost Indekos. Panel administrasi pengelola indekos.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
