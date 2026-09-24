import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/auth";
import { loginRequest } from "../services/authService";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginRequest(email, password);
      setSession(result.token, result.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border border-blue-200 bg-white shadow-[0_28px_80px_rgba(2,8,23,0.20)] ring-1 ring-blue-100">
      <div className="bg-[linear-gradient(135deg,#0c2d5a_0%,#173d79_40%,#edc05b_100%)] px-6 py-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/80">Administration</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">CMS Login</h1>
      </div>
      <CardContent className="bg-slate-50 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-navy-800">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lionscollege.com"
              className="h-11 border-slate-300 bg-white text-navy-900 shadow-inner focus-visible:ring-gold-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm font-semibold text-navy-800">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 border-slate-300 bg-white text-navy-900 shadow-inner focus-visible:ring-gold-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 bg-[linear-gradient(135deg,#0d2d5a_0%,#123d7c_100%)] text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
          >
            {loading && <Spinner className="text-white" />}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
