const Footer = () => {
  return (
    <footer
      className="w-full mt-12 py-10 px-8 hidden md:block"
      style={{ background: '#0F1B3D', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3
              className="text-xl font-bold font-playfair mb-4"
              style={{
                background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Buddy4day
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Your professional social companion platform for every activity.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms & Conditions'].map((item) => (
                <a key={item} href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">For Clients</h4>
            <div className="flex flex-col gap-2">
              {['Browse Companions', 'How it Works', 'Safety', 'Reviews'].map((item) => (
                <a key={item} href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">For Companions</h4>
            <div className="flex flex-col gap-2">
              {['Register as Companion', 'Companion Guidelines', 'Payouts', 'Support'].map((item) => (
                <a key={item} href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-white/30 text-xs">© 2026 Buddy4day. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['X', 'Instagram', 'LinkedIn'].map((social) => (
              <a key={social} href="#" className="text-white/40 text-xs hover:text-white transition-colors">{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;