import { useExamStore } from "../store/examStore";
import Navbar from "../components/shared/Navbar";

export default function ExamPage() {
  const subjects = useExamStore((s) => s.selectedSubjects);

  return (
    <div className="min-h-screen bg-jamb-light">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <h2 className="text-2xl font-bold text-jamb-blue mb-4">
            Exam Engine
          </h2>
          <p className="text-gray-500 mb-4">
            Selected subjects:
          </p>
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li key={s} className="bg-jamb-light text-jamb-blue
                                     font-medium py-2 px-4 rounded-lg">
                {s}
              </li>
            ))}
          </ul>
          <p className="text-gray-400 text-sm mt-6">
            ⚙️ Exam engine coming in next phase...
          </p>
        </div>
      </div>
    </div>
  );
}
