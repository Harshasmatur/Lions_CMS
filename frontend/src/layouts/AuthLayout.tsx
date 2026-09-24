import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1d4f9a_0%,_#12386a_38%,_#071b32_100%)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 rounded-[22px] border border-blue-200/60 bg-white/95 p-4 shadow-[0_18px_45px_rgba(2,8,23,0.35)] backdrop-blur-sm">
          <div className="flex justify-center">
            <img
              src="/lions-pu-college-logo.svg"
              alt="Lions PU College"
              className="h-16 w-auto max-w-[400px] object-contain drop-shadow-[0_8px_18px_rgba(17,52,106,0.12)]"
            />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
