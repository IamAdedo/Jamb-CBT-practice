export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-jamb-light">
      <div className="w-12 h-12 border-4 border-jamb-blue border-t-transparent
                      rounded-full animate-spin mb-4" />
      <p className="text-jamb-blue font-medium">{message}</p>
    </div>
  );
}
