import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-jamb-light">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-jamb-blue rounded-full flex items-center
                          justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">J</span>
          </div>
          <h1 className="text-2xl font-bold text-jamb-blue">
            JAMB CBT Practice
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your Registration Number to begin
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-gray-400 mt-6">
          JAMB CBT Practice Portal · For educational use only
        </p>
      </div>
    </div>
  );
}
