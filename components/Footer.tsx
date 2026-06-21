export default function Footer() {
    return (
        <footer className="bg-[#0B0B0B] text-white">

            <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

                {/* BRAND */}
                <div>
                    <h3 className="text-[#C8A24A] text-lg">RomaBeautyAcademy</h3>
                    <p className="mt-3 text-white/60 text-sm">
                        Luxury Beauty Studio
                    </p>
                </div>

                {/* NAVIGATION */}
                <div>
                    <h4 className="text-[#C8A24A]">Navigation</h4>

                    <ul className="mt-3 space-y-3 text-sm text-white/60">

                        <li className="relative w-fit group">
                            <a href="#home">Home</a>
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                        <li className="relative w-fit group">
                            <a href="#services">Services</a>
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                        <li className="relative w-fit group">
                            <a href="#about">About</a>
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                        <li className="relative w-fit group">
                            <a href="#contact">Contact</a>
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                    </ul>
                </div>

                {/* LEGAL */}
                <div>
                    <h4 className="text-[#C8A24A]">Rechtliches</h4>

                    <ul className="mt-3 space-y-3 text-sm text-white/60">

                        <li className="relative w-fit group cursor-pointer">
                            AGB
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                        <li className="relative w-fit group cursor-pointer">
                            Impressum
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                        <li className="relative w-fit group cursor-pointer">
                            Datenschutz
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </li>

                    </ul>
                </div>

                {/* SOCIAL */}
                <div>
                    <h4 className="text-[#C8A24A]">Social</h4>

                    <div className="mt-3 flex flex-col gap-3 text-sm text-white/60">

                        <a className="relative w-fit group cursor-pointer">
                            Instagram
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </a>

                        <a className="relative w-fit group cursor-pointer">
                            TikTok
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </a>

                        <a className="relative w-fit group cursor-pointer">
                            Facebook
                            <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-[#C8A24A] transition-all duration-300 group-hover:w-full"></span>
                        </a>

                    </div>
                </div>

            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-white/10 text-center text-xs text-white/40 py-6">
                © 2026 RomaBeautyAcademy — All rights reserved
            </div>

        </footer>
    );
}