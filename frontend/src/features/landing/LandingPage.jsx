import "./LandingPage.css";

function LandingPage({ onSignIn }) {
  const features = [
    { icon: "📋", title: "Purchase requests", body: "Employees draft, itemize, and submit requests in seconds." },
    { icon: "✅", title: "Approvals", body: "Approvers review and approve or reject with one click." },
    { icon: "📦", title: "Purchase orders", body: "Convert approvals into POs, routed to the right vendors." },
    { icon: "🏢", title: "Vendors", body: "Central vendor directory with contacts and details." },
    { icon: "🚚", title: "Goods receiving", body: "Log received quantities; PO status updates automatically." },
    { icon: "🛡️", title: "Roles & access", body: "Requester, approver, receiver, admin — built in from day one." },
  ];

  return (
    <div className="landing-page">
      {/* top header bar */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-logo"></div>
          <span>Procurement System</span>
        </div>
        <div className="landing-header-actions">
          <button className="landing-btn-ghost" onClick={onSignIn}>
            Sign in
          </button>
          <button className="landing-btn-primary" onClick={onSignIn}>
            Get started
          </button>
        </div>
      </header>

      {/* hero section */}
      <main className="landing-main">
        <div className="landing-hero">
          <h1>Procurement, without the paperwork.</h1>
          <p>
            Track requests, approvals, purchase orders, vendors, and goods
            received — one clean workspace for your whole team.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-primary landing-btn-lg" onClick={onSignIn}>
              Create account
            </button>
            <button className="landing-btn-outline landing-btn-lg" onClick={onSignIn}>
              Sign in
            </button>
          </div>
        </div>

        {/* feature cards grid */}
        <div className="landing-grid">
          {features.map((f, index) => (
            <div className="landing-card" key={index}>
              <div className="landing-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Procurement System
      </footer>
    </div>
  );
}

export default LandingPage;