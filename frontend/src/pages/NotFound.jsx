import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h1 className="text-5xl font-bold text-blue-700 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Page not found</p>
      <Link
        to="/"
        className="text-blue-600 underline hover:text-blue-800"
      >
        Go Back Home
      </Link>
    </div>
  );
}
