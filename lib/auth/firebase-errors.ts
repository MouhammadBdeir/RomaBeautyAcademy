// Übersetzt häufige Firebase-Auth-Fehlercodes in verständliche deutsche Texte.
// Bewusst client-sicher (keine Server-Imports).
export function mapFirebaseError(message: string): string {
    if (
        message.includes("auth/invalid-credential") ||
        message.includes("auth/wrong-password") ||
        message.includes("auth/user-not-found")
    ) {
        return "E-Mail oder Passwort ist falsch.";
    }
    if (message.includes("auth/email-already-in-use")) {
        return "Diese E-Mail ist bereits registriert. Bitte einloggen.";
    }
    if (message.includes("auth/weak-password")) {
        return "Das Passwort ist zu schwach (mindestens 6 Zeichen).";
    }
    if (message.includes("auth/invalid-email")) {
        return "Ungültige E-Mail-Adresse.";
    }
    if (message.includes("auth/too-many-requests")) {
        return "Zu viele Versuche. Bitte später erneut versuchen.";
    }
    if (message.includes("auth/operation-not-allowed")) {
        return "E-Mail/Passwort-Anmeldung ist in Firebase nicht aktiviert.";
    }
    return message.replace("Firebase:", "").trim() || "Etwas ist schiefgelaufen.";
}
