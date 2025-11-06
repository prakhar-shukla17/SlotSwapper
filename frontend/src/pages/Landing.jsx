import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="container mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
        {/* App Logo & Name */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            SlotSwapper
          </h1>
          <p className="text-lg text-gray-500">Schedule made simple</p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <Link
            to="/login"
            className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border-2 border-blue-100 text-center shadow-sm hover:shadow-md transition-all duration-200"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} SlotSwapper
      </footer>
    </div>
  );
}
