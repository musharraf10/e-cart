export function Footer() {
  return (
    <footer className="border-t border-borderlux bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 text-xs text-muted flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} NoorFit. All rights reserved.</span>
        <span>Crafted for Comfort. Designed for Life.</span>
      </div>
    </footer>
  );
}
