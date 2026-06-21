// Server-seitiges Lesen der Kontaktdaten (Admin-SDK).
import { adminDb } from "@/lib/firebase/admin";
import { DEFAULT_CONTACT, type ContactData, type SocialLink } from "./types";

function str(v: unknown): string {
    return typeof v === "string" ? v : "";
}

export async function getContactData(): Promise<ContactData> {
    try {
        const snap = await adminDb().collection("config").doc("contactData").get();
        const x = (snap.data() ?? {}) as Record<string, unknown>;

        const social: SocialLink[] = Array.isArray(x.social)
            ? (x.social as unknown[])
                  .map((s, i) => {
                      const o = (s ?? {}) as Record<string, unknown>;
                      return {
                          id: str(o.id) || String(i),
                          label: str(o.label),
                          url: str(o.url),
                      };
                  })
                  .filter((s) => s.url)
            : [];

        return {
            email: str(x.email),
            phone: str(x.phone),
            street: str(x.street),
            zip: str(x.zip),
            city: str(x.city),
            country: str(x.country) || "Deutschland",
            managingDirector: str(x.managingDirector),
            registerCourt: str(x.registerCourt),
            hrb: str(x.hrb),
            vatId: str(x.vatId),
            social,
        };
    } catch {
        return { ...DEFAULT_CONTACT };
    }
}
