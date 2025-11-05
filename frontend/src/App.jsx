import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import MyEvents from "./pages/Dashboard/MyEvents";
import Marketplace from "./pages/Dashboard/Marketplace";
import Requests from "./pages/Dashboard/Requests";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationCenter from "./components/NotificationCenter";

export default function App() {
  return (
    <BrowserRouter>
      <NotificationCenter />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MyEvents />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/requests" element={<Requests />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
