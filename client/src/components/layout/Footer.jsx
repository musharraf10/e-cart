export function Footer() {
  return (
    <footer className="border-t border-[#262626] bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-[#a1a1aa] flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} NoorFit. All rights reserved.</span>
        <span className="text-[#a1a1aa]">Crafted for Comfort. Designed for Life.</span>
      </div>
    </footer>
  );
}

