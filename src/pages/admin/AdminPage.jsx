import Navbar from "../../components/shared/Navbar";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-jamb-light">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <h2 className="text-2xl font-bold text-jamb-blue mb-4">
            Admin Panel
          </h2>
          <p className="text-gray-400 text-sm">
            ⚙️ Question uploader coming in Phase 3...
          </p>
        </div>
      </div>
    </div>
  );
}
