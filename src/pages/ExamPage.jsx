import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExamStore } from "../store/examStore";
import ExamEngine from "../components/exam/ExamEngine";

export default function ExamPage() {
  const navigate = useNavigate();
  const selectedSubjects = useExamStore((s) => s.selectedSubjects);

  // Guard: can't enter exam without subject selection
  useEffect(() => {
    if (!selectedSubjects || selectedSubjects.length === 0) {
      navigate("/", { replace: true });
    }
  }, [selectedSubjects, navigate]);

  if (!selectedSubjects?.length) return null;

  return <ExamEngine />;
}
