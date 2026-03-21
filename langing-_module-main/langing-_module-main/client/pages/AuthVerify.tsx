import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      window.location.href = "https://youtube.com";
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
