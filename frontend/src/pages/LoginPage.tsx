import React, { useState } from "react";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { login } from "../api/auth";

const LoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      window.location.href = "/game";
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#0A0F1C] relative">
        {/* Background texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235ec3b8' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(94,195,184,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(94,195,184,0.02) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow flex items-center justify-center pt-16 pb-20 px-4">
            <div className="w-full max-w-md">
              <div className="bg-[#1A1F2C] border border-[#5ec3b8] rounded-lg p-8 shadow-xl backdrop-blur-sm">
                <h1 className="text-[#E05219] font-['Press_Start_2P'] text-2xl font-bold text-center mb-8">
                  Login
                </h1>

                {error && (
                  <div
                    role="alert"
                    className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm"
                  >
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  aria-label="Login form"
                  className="space-y-6"
                >
                  <div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={form.username}
                      onChange={handleChange}
                      aria-label="Username"
                      autoComplete="username"
                      required
                      className="w-full px-4 py-3 bg-[#0A0F1C] border border-[#5ec3b8] rounded-lg text-[#E8E6E3] placeholder-[#8B8A91] focus:border-[#5ec3b8] focus:outline-none transition-colors font-['Press_Start_2P'] text-sm"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      aria-label="Password"
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 bg-[#0A0F1C] border border-[#5ec3b8] rounded-lg text-[#E8E6E3] placeholder-[#8B8A91] focus:border-[#5ec3b8] focus:outline-none transition-colors font-['Press_Start_2P'] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#5ec3b8] hover:bg-[#55b0a5] disabled:bg-[#8B8A91] text-[#E8E6E3] font-['Press_Start_2P'] font-bold px-6 py-3 rounded-none border-4 border-[#5ec3b8] hover:border-[#55b0a5] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(94,195,184,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(94,195,184,0.8)] transform hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:transform-none disabled:shadow-[2px_2px_0px_0px_rgba(139,138,145,0.8)] relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {loading ? "Logging in..." : "Log In"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                  </button>
                </form>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
