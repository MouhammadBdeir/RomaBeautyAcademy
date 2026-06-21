// Kontaktdaten der Website (öffentlich angezeigt + Impressums-Pflichtangaben).
// Client-sicher (keine Server-Imports).

export type SocialLink = {
    id: string;
    label: string; // z. B. "Instagram", "TikTok", "WhatsApp" …
    url: string;
};

export type ContactData = {
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    country: string;
    managingDirector: string; // Geschäftsführer
    registerCourt: string; // Registergericht
    hrb: string; // Handelsregisternummer
    vatId: string; // USt-IdNr. (für Impressum)
    social: SocialLink[]; // beliebig viele
};

export const DEFAULT_CONTACT: ContactData = {
    email: "",
    phone: "",
    street: "",
    zip: "",
    city: "",
    country: "Deutschland",
    managingDirector: "",
    registerCourt: "",
    hrb: "",
    vatId: "",
    social: [],
};
