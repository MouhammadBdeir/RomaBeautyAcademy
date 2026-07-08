"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { mapFirebaseError } from "@/lib/auth/firebase-errors";
import { useT } from "@/components/admin/AdminI18nProvider";

export default function AdminLoginPage() {
    const { t } = useT();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await cred.user.getIdToken();

            const res = await fetch("/api/admin/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                // Kein Server-Zugriff -> lokale Firebase-Session verwerfen.
                await auth.signOut().catch(() => {});
                throw new Error(data.error ?? t("Login fehlgeschlagen."));
            }

            router.push("/admin");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? mapFirebaseError(err.message) : t("Login fehlgeschlagen."));
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F7F3EE] px-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-black/5 p-8">
                <div className="text-center">
                    <div className="tracking-[0.25em] font-bold">
                        <span className="text-[#C8A24A] font-medium">RomaBeauty</span>Academy
                    </div>
                    <h1 className="mt-6 text-3xl font-light text-[#0B0B0B]">{t("Admin Login")}</h1>
                    <p className="mt-2 text-sm text-gray-500">{t("Bitte melde dich an.")}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-600 mb-1">{t("E-Mail")}</label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl border border-black/10 outline-none focus:border-[#C8A24A]"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-600 mb-1">{t("Passwort")}</label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-xl border border-black/10 outline-none focus:border-[#C8A24A]"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-full bg-[#C8A24A] text-black font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? t("Anmelden …") : t("Anmelden")}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    {t("Noch kein Konto?")}{" "}
                    <Link href="/admin/register" className="text-[#C8A24A] hover:underline">
                        {t("Registrieren")}
                    </Link>
                </p>
            </div>
        </main>
    );
}
