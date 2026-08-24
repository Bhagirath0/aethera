const NAV_ITEMS = ['Studio', 'About', 'Journal', 'Reach Us']

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
      <a
        href="#"
        className="text-3xl tracking-tight font-serif"
        style={{ color: '#000000' }}
      >
        Aethera<sup className="text-base align-super">®</sup>
      </a>

      <div className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm transition-colors" style={{ color: '#000000' }}>
          Home
        </a>
        {NAV_ITEMS.map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm transition-colors hover:opacity-70"
            style={{ color: '#6F6F6F' }}
          >
            {item}
          </a>
        ))}
      </div>

      <button
        className="rounded-full px-6 py-2.5 text-sm transition-transform duration-300 hover:scale-[1.03]"
        style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
      >
        Begin Journey
      </button>
    </nav>
  )
}
