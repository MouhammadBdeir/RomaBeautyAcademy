// Server-seitige Benutzerliste (Admin-SDK) für die Dashboard-Tabelle.
import { adminAuth } from "@/lib/firebase/admin";

export type UserRole = "owner" | "admin" | "pending";

export type AdminUser = {
    uid: string;
    email: string;
    role: UserRole;
    created: string;
    lastLogin: string;
};

// Deterministische Datumsformatierung (kein Locale/Timezone -> kein Hydration-Mismatch).
function fmtDate(input?: string): string {
    if (!input) return "—";
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getUTCFullYear()}`;
}

const ROLE_ORDER: Record<UserRole, number> = { owner: 0, admin: 1, pending: 2 };

export async function listUsers(): Promise<AdminUser[]> {
    try {
        const ownerEmail = process.env.ADMIN_OWNER_EMAIL?.toLowerCase();
        const res = await adminAuth().listUsers(1000);

        const users: AdminUser[] = res.users.map((u) => {
            const claims = u.customClaims ?? {};
            const isOwner =
                claims.owner === true ||
                (!!u.email && !!ownerEmail && u.email.toLowerCase() === ownerEmail);
            const isAdmin = claims.admin === true || isOwner;

            return {
                uid: u.uid,
                email: u.email ?? "(keine E-Mail)",
                role: isOwner ? "owner" : isAdmin ? "admin" : "pending",
                created: fmtDate(u.metadata.creationTime),
                lastLogin: fmtDate(u.metadata.lastSignInTime),
            };
        });

        users.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.email.localeCompare(b.email));
        return users;
    } catch {
        return [];
    }
}
