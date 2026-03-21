import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, LogOut, User, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

function parseJwt(token: string): UserInfo | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.id, name: payload.name, email: payload.email };
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }
    const info = parseJwt(token);
    if (!info) {
      localStorage.removeItem("auth_token");
      navigate("/login");
      return;
    }
    setUser(info);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Activity className="h-6 w-6" />
          <span>CareNova Dashboard</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, {user.name}!
        </h1>

        {/* Profile card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Full Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{user.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Account ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold truncate">{user.id}</p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder modules */}
        <Card>
          <CardHeader>
            <CardTitle>Your Health Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Your health modules and records will appear here. Explore the{" "}
              <a href="/modules" className="text-primary hover:underline">
                Modules
              </a>{" "}
              page to learn more.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
