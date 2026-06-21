
export default function Loading() {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Seite wird geladen"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--brand-surface)]"
        >
            <div className="flex flex-col items-center gap-6">
                <div className="tracking-[0.25em] font-bold text-lg sm:text-xl">
                    <span className="text-[var(--brand)] font-medium">RomaBeauty</span>Academy
                </div>

                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--brand)]/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--brand)] animate-spin" />
                </div>

                <p className="text-sm text-[var(--brand-text)]/60 font-medium tracking-wide">
                    Wird geladen …
                </p>
            </div>
        </div>
    );
}
