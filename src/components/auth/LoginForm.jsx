import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function LoginForm() {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmed = regNo.trim();
    const mockEmail = `${trimmed.toLowerCase()}@jambcbt.mock`;
    const mockPassword = trimmed;

    // Try sign-in first
    let { error: signInError } = await supabase.auth.signInWithPassword({
      email: mockEmail,
      password: mockPassword,
    });

    if (signInError) {
      // First-time: auto-register
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: mockEmail,
          password: mockPassword,
        });

      if (signUpError) {
        setError("Could not create account. Please try again.");
        setLoading(false);
        return;
      }

      // Insert user profile
      if (signUpData.user) {
        await supabase.from("users").insert({
          id: signUpData.user.id,
          reg_number: trimmed.toUpperCase(),
          full_name: `Student ${trimmed.toUpperCase()}`,
          role: "student",
        });
      }
    }

    setLoading(false);
    navigate("/");
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Registration Number
        </label>
        <input
          type="text"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          placeholder="e.g. 20249012345AB"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-jamb-blue
                     text-sm uppercase tracking-widest"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !regNo.trim()}
        className="w-full bg-jamb-blue text-white py-3 rounded-lg font-semibold
                   hover:bg-blue-900 transition disabled:opacity-50
                   disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Proceed to Exam →"}
      </button>
    </form>
  );
}
