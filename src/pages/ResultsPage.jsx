import { useNavigate } from "react-router-dom";
import Navbar from "../components/shared/Navbar";

export default function ResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-jamb-light">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <h2 className="text-2xl font-bold text-jamb-blue mb-4">
            Your Results
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            ⚙️ Results display coming in next phase...
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 bg-jamb-blue text-white px-6 py-2 rounded-lg
                       font-semibold hover:bg-blue-900 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
