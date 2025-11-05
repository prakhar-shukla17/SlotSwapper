import AuthForm from "../../components/AuthForm";

export default function Register() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <AuthForm type="register" />
    </div>
  );
}
