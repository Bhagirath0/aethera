export default function Hero() {
  return (
    <section
      className="relative z-10 flex flex-col items-center justify-center text-center px-6 pb-40"
      style={{ paddingTop: 'calc(8rem - 75px)' }}
    >
      <h1
        className="animate-fade-rise font-serif font-normal text-5xl sm:text-7xl md:text-8xl max-w-7xl"
        style={{ lineHeight: 0.95, letterSpacing: '-2.46px', color: '#000000' }}
      >
        Beyond <em className="italic" style={{ color: '#6F6F6F' }}>silence,</em> we build{' '}
        <em className="italic" style={{ color: '#6F6F6F' }}>the eternal.</em>
      </h1>

      <p
        className="animate-fade-rise-delay text-base sm:text-lg max-w-2xl mt-8 leading-relaxed"
        style={{ color: '#6F6F6F' }}
      >
        Building platforms for brilliant minds, fearless makers, and thoughtful souls. Through
        the noise, we craft digital havens for deep work and pure flows.
      </p>

      <button
        className="animate-fade-rise-delay-2 rounded-full px-14 py-5 text-base mt-12 transition-transform duration-300 hover:scale-[1.03]"
        style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
      >
        Begin Journey
      </button>
    </section>
  )
}
