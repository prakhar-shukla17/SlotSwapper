import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold text-blue-800 mb-3">SlotSwapper</h1>
      <p className="text-gray-700 mb-6 max-w-md text-center">
        A peer-to-peer calendar app that lets you swap time slots with others effortlessly.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="border border-blue-600 text-blue-600 px-5 py-2 rounded-md hover:bg-blue-100 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
