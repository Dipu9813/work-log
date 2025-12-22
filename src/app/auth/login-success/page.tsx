"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect after one loop of the GIF (about 1.5s)
    const timer = setTimeout(() => {
      router.push("/");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#fff', width: '100vw', height: '100vh', margin: 0, padding: 0 }}
    >
      <img
        src="/Login_character_login_successful_20251214101012.gif"
        alt="Login Successful Animation"
        className="w-80 h-80"
        style={{ margin: "0 auto" }}
      />
    </div>
  );
}
