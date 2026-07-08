"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { mapFirebaseError } from "@/lib/auth/firebase-errors";
import { useT } from "@/components/admin/AdminI18nProvider";

export default function AdminRegisterPage() {
    const { t } = useT();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await cred.user.getIdToken();

            const res = await fetch("/api/admin/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? t("Registrierung fehlgeschlagen."));
            }

            // Bis zur Freigabe kein Admin-Zugriff -> lokale Session beenden.
            await auth.signOut().catch(() => {});
            setDone(true);
        } catch (err) {
            setError(err instanceof Error ? mapFirebaseError(err.message) : t("Registrierung fehlgeschlagen."));
        } finally {
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
                    <h1 className="mt-6 text-3xl font-light text-[#0B0B0B]">{t("Admin Registrierung")}</h1>
                </div>

                {done ? (
                    <div className="mt-8 text-center space-y-4">
                        <div className="text-4xl">✅</div>
                        <p className="text-gray-700">
                            {t("Deine Registrierung ist eingegangen. Ein Owner muss dein Konto freigeben, bevor du dich einloggen kannst.")}
                        </p>
                        <Link href="/admin/login" className="inline-block text-[#C8A24A] hover:underline">
                            {t("Zum Login")}
                        </Link>
                    </div>
                ) : (
                    <>
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
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-black/10 outline-none focus:border-[#C8A24A]"
                                />
                                <p className="mt-1 text-xs text-gray-400">{t("Mindestens 6 Zeichen.")}</p>
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-full bg-[#C8A24A] text-black font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? t("Registrieren …") : t("Registrieren")}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            {t("Schon ein Konto?")}{" "}
                            <Link href="/admin/login" className="text-[#C8A24A] hover:underline">
                                {t("Einloggen")}
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
