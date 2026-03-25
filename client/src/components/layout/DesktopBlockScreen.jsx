import { motion } from "framer-motion";

export function DesktopBlockScreen() {
  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center px-4 text-center bg-[#0f0f0f] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-2xl flex flex-col items-center justify-center"
      >
        <div className="flex flex-col items-center justify-center h-full">

          {/* Logo */}
          <div className="text-3xl md:text-4xl font-bold tracking-tight">
            NoorFit
          </div>

          {/* Heading */}
          <div className="mt-6 space-y-2">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              Mobile-first experience
            </h1>
            <p className="text-muted text-sm md:text-base max-w-md mx-auto">
              This platform is optimized for mobile shopping. Please open NoorFit
              on your phone for the best experience.
            </p>
          </div>

          {/* Mock UI */}
          <div className="mt-6 flex items-center justify-center">
            <div className="w-full max-w-xs rounded-[24px] border border-[#262626] bg-[#111111] shadow-card overflow-hidden scale-[0.9]">
              <div className="h-8 flex items-center justify-center gap-2 border-b border-[#262626] text-xs text-muted">
                <span className="w-2 h-2 rounded-full bg-[#262626]" />
                <span className="w-2 h-2 rounded-full bg-[#262626]" />
                <span className="w-2 h-2 rounded-full bg-[#262626]" />
              </div>

              <div className="p-4">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#262626] flex items-center justify-center">
                  <div className="w-[80%] rounded-2xl border border-[#262626] bg-[#0f0f0f] overflow-hidden">
                    <div className="h-8 border-b border-[#262626] flex items-center px-2">
                      <div className="h-5 w-full rounded-xl bg-[#171717] border border-[#262626]" />
                    </div>

                    <div className="p-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square rounded-xl bg-[#171717] border border-[#262626]" />
                        <div className="aspect-square rounded-xl bg-[#171717] border border-[#262626]" />
                      </div>
                      <div className="h-2 w-2/3 rounded bg-[#171717]" />
                      <div className="h-2 w-1/2 rounded bg-[#171717]" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-2 w-20 mx-auto rounded-full bg-[#262626]" />
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 bg-[#a6c655] text-black rounded-xl h-11 w-full max-w-xs font-semibold active:scale-[0.99] transition-transform"
          >
            Continue on Mobile
          </button>

          {/* Login */}
          <p className="mt-4 text-xs text-muted">
            <a href="/auth">Login</a>
          </p>

        </div>
      </motion.div>
    </div>
  );
}