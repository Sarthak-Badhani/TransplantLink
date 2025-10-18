export default function Navbar({ onToggleSidebar, username='admin' }) {
  return (
    <header className="navbar px-3 py-2 position-relative d-flex align-items-center" style={{minHeight:56}}>
      <div className="d-flex align-items-center gap-2 position-relative z-2">
        <button className="btn btn-outline-success d-lg-none" onClick={onToggleSidebar} aria-label="Toggle sidebar">☰</button>
      </div>
      <div className="position-absolute top-50 start-50 translate-middle text-center" style={{pointerEvents:'none'}}>
        <span className="fw-semibold" style={{ color: 'var(--brand-green)', letterSpacing:.5 }}>Transplant Link</span>
      </div>
      <div className="ms-auto d-flex align-items-center gap-2 position-relative z-2">
        <span className="small text-muted">{username}</span>
      </div>
    </header>
  );
}
