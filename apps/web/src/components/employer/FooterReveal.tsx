interface FooterRevealProps {
  logoMark: string;
}

export default function FooterReveal({ logoMark }: FooterRevealProps) {
  const handleToast = (msg: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: msg }));
  };

  return (
    <>
      {/* Creates the scroll distance that exposes the fixed footer behind <main>. */}
      <div className="footer-reveal-spacer" aria-hidden="true" />

      <footer className="footer-reveal-fixed" aria-label="Footer navigation">
        {/* Giant decorative Employr wordmark (background watermark) */}
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          className="footer-reveal-watermark"
        />
        <div className="footer-reveal-inner">
          <div className="editorial-frame footer__top">
            <div>
              <div className="brand-mark">
                <img src={logoMark} alt="Employr" className="brand-symbol" />
              </div>
              <p>Start your career journey today.</p>
            </div>
            <div className="footer__links">
              <div>
                <b>Product</b>
                <button type="button" onClick={() => handleToast('CV Builder coming soon.')}>CV Builder</button>
                <button type="button" onClick={() => handleToast('Job search coming soon.')}>Find Jobs</button>
                <button type="button" onClick={() => handleToast('CV matching coming soon.')}>Match CV</button>
                <button type="button" onClick={() => handleToast('Career switch coming soon.')}>Switch Careers</button>
              </div>
              <div>
                <b>Insights</b>
                <button type="button" onClick={() => handleToast('Career guides coming soon.')}>Career Guide</button>
                <button type="button" onClick={() => handleToast('CV tips coming soon.')}>CV Tips</button>
                <button type="button" onClick={() => handleToast('Market insights coming soon.')}>Market Insights</button>
              </div>
              <div>
                <b>Company</b>
                <button type="button" onClick={() => handleToast('About Employr coming soon.')}>About</button>
                <button type="button" onClick={() => handleToast('Contact details coming soon.')}>Contact</button>
                <button type="button" onClick={() => handleToast('Privacy policy coming soon.')}>Privacy</button>
              </div>
            </div>
          </div>

          <div className="editorial-frame footer__bottom">
            <span>© 2026 Employr · Career Operating System</span>
            <span>YOUR CAREER, BUILT FOR YOU.</span>
            <span>JAKARTA · INDONESIA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
