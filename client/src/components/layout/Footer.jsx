export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} NoorFit. All rights reserved.</span>
        <span>Crafted for Comfort. Designed for Life.</span>
      </div>
    </footer>
  );
}

