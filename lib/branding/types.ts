// Branding der öffentlichen Seite (Navbar-Stil). Client-sicher.

export type NavbarStyle = "serif" | "script" | "modern";

export type BrandingData = {
    navbarStyle: NavbarStyle;
};

export const DEFAULT_BRANDING: BrandingData = { navbarStyle: "serif" };

export const NAVBAR_STYLES: { value: NavbarStyle; label: string; hint: string }[] = [
    { value: "serif", label: "Serif Luxe", hint: "Edel & klassisch" },
    { value: "script", label: "Script Elegance", hint: "Schreibschrift, luxuriös" },
    { value: "modern", label: "Modern Gold", hint: "Klar & gespreizt" },
];

export function isNavbarStyle(v: unknown): v is NavbarStyle {
    return v === "serif" || v === "script" || v === "modern";
}

export function mergeBranding(raw: unknown): BrandingData {
    const x = (raw ?? {}) as Record<string, unknown>;
    return { navbarStyle: isNavbarStyle(x.navbarStyle) ? x.navbarStyle : "serif" };
}
