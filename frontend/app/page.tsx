import Link from "next/link";
import { Truck, User, Route, Wrench, IndianRupee } from "lucide-react";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="landing-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="logo-text">TransitOps</span>
        </Link>

        <nav 
          className="nav-pill"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(40px) saturate(150%)",
            WebkitBackdropFilter: "blur(40px) saturate(150%)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
          }}
        >
          <a href="#platform" className="nav-link">Platform</a>
          <a href="#modules" className="nav-link">Modules</a>
          <a href="#workflow" className="nav-link">Workflow</a>
          <a href="#industries" className="nav-link">Industries</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </nav>

        <div className="nav-right">
          <Link href="/login" className="sign-in-btn">Sign in</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-label">Beta</span>
          <span className="badge-text"><strong>TransitOps</strong> — smart transport operations platform.</span>
        </div>

        <h1 className="hero-title">
          <span className="serif-italic">Transport</span>{" "}
          <span className="accent-word">clarity,</span>{" "}
          <span className="serif-italic">built in.</span>
        </h1>

        <p className="hero-subtitle">
          Vehicles, drivers, trips, and maintenance—{" "}
          <strong>all tied to a dashboard you can trust.</strong>{" "}
          Multi-role access, document-driven workflows, automatic status transitions by default.
        </p>

        <div className="hero-buttons">
          <Link href="/register" className="btn-primary">
            Get started <span className="arrow">↗</span>
          </Link>
          <Link href="/login" className="btn-secondary">
            Explore the platform <span className="arrow">↗</span>
          </Link>
        </div>

        {/* Floating Cards */}
        <div className="floating-card card-left">
          <span className="card-label">WORKFLOW</span>
          <h3 className="card-title"><em>Draft to done</em></h3>
          <p className="card-desc">Same lifecycle for trips, maintenance, and expenses—Draft → Dispatched → Completed.</p>
        </div>

        <div className="floating-card card-right-top">
          <span className="card-label">SYNC</span>
          <h3 className="card-title"><em>Live</em></h3>
          <p className="card-desc">Vehicle & driver statuses update automatically as trips move through stages.</p>
        </div>

        <div className="floating-card card-right-bottom">
          <h3 className="card-title"><em>Role-scoped</em></h3>
          <p className="card-desc">Fleet managers, dispatchers, safety officers—each sees what matters.</p>
        </div>

        <div className="scroll-indicator">SCROLL TO EXPLORE</div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="section-platform">
        <div className="section-header-left">
          <span className="section-label">PLATFORM</span>
          <h2 className="section-title">
            <span className="serif-italic">Fleet depth.</span><br/>
            App <span className="accent-word">simplicity.</span>
          </h2>
        </div>
        <p className="section-desc-right">
          Deep fleet management semantics without burying people in configuration—vehicles, drivers, trips, and analytics in one place.
        </p>
      </section>

      {/* Four Pillars */}
      <section className="pillars-section">
        <div className="section-intro">
          <h2 className="section-title-serif">
            From <em>org setup</em> to <span className="accent-word">daily</span> ops.
          </h2>
          <p className="section-intro-desc">Four pillars: fleet registry, driver management, trip lifecycle, and the analytics layer your team actually uses.</p>
        </div>
        <div className="pillars-grid">
          <div className="pillar-card pillar-active">
            <span className="pillar-badge">START HERE</span>
            <span className="pillar-num">01</span>
            <h3 className="pillar-title">Your fleet, <em>registered</em></h3>
            <p className="pillar-desc">Vehicle registry with type, capacity, odometer, and acquisition cost. Unique registration numbers enforced.</p>
          </div>
          <div className="pillar-card">
            <span className="pillar-num">02</span>
            <h3 className="pillar-title">Drivers that <em>mirror the road</em></h3>
            <p className="pillar-desc">License tracking, safety scores, contact info, and automatic status changes when dispatched or completing trips.</p>
          </div>
          <div className="pillar-card">
            <span className="pillar-num">03</span>
            <h3 className="pillar-title">Trips you can <em>trust</em></h3>
            <p className="pillar-desc">Source-to-destination tracking with cargo validation, planned distance, and full lifecycle from Draft to Completed.</p>
          </div>
          <div className="pillar-card">
            <span className="pillar-num">04</span>
            <h3 className="pillar-title">Built for <em>daily</em> ops</h3>
            <p className="pillar-desc">Responsive dashboard, real-time KPIs, CSV export, searchable tables, and charts that update live.</p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="modules-section">
        <span className="section-label">MODULES</span>
        <h2 className="section-title-serif">
          <span className="serif-italic">Five modules.</span> One platform.
        </h2>
        <div className="modules-grid">
          <div className="module-card">
            <div className="module-icon text-slate-700 bg-slate-100 flex items-center justify-center p-3 rounded-xl w-fit mb-4"><Truck size={28} /></div>
            <h3>Vehicle Registry</h3>
            <p>Register vehicles with type, capacity, odometer, acquisition cost. Status auto-updates on dispatch and maintenance.</p>
          </div>
          <div className="module-card">
            <div className="module-icon text-slate-700 bg-slate-100 flex items-center justify-center p-3 rounded-xl w-fit mb-4"><User size={28} /></div>
            <h3>Driver Management</h3>
            <p>Track licenses, categories, expiry dates, safety scores. Expired or suspended drivers are blocked from dispatch.</p>
          </div>
          <div className="module-card">
            <div className="module-icon text-slate-700 bg-slate-100 flex items-center justify-center p-3 rounded-xl w-fit mb-4"><Route size={28} /></div>
            <h3>Trip Management</h3>
            <p>Create trips with source, destination, cargo weight, planned distance. Automatic status transitions on dispatch.</p>
          </div>
          <div className="module-card">
            <div className="module-icon text-slate-700 bg-slate-100 flex items-center justify-center p-3 rounded-xl w-fit mb-4"><Wrench size={28} /></div>
            <h3>Maintenance</h3>
            <p>Log maintenance records. Creating one auto-switches vehicle to In Shop, closing restores to Available.</p>
          </div>
          <div className="module-card">
            <div className="module-icon text-slate-700 bg-slate-100 flex items-center justify-center p-3 rounded-xl w-fit mb-4"><IndianRupee size={28} /></div>
            <h3>Fuel & Expenses</h3>
            <p>Track fuel (liters + cost), tolls, and other expenses per vehicle and trip. Compute operational costs automatically.</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="workflow-section">
        <span className="section-label">WORKFLOW</span>
        <h2 className="section-title-serif">
          Every trip follows one <span className="accent-word">pipeline.</span>
        </h2>
        <div className="workflow-pipeline">
          <div className="workflow-step">
            <div className="step-indicator step-active">
              <div className="step-dot"></div>
              <div className="step-line"></div>
            </div>
            <div className="step-content">
              <h3>Draft</h3>
              <p>Trip is created with source, destination, vehicle, driver, and cargo weight. Validations run automatically.</p>
            </div>
          </div>
          <div className="workflow-step">
            <div className="step-indicator step-active">
              <div className="step-dot"></div>
              <div className="step-line"></div>
            </div>
            <div className="step-content">
              <h3>Dispatched</h3>
              <p>Vehicle and driver status automatically switch to <strong>On Trip</strong>. No double-booking allowed.</p>
            </div>
          </div>
          <div className="workflow-step">
            <div className="step-indicator step-active">
              <div className="step-dot"></div>
              <div className="step-line"></div>
            </div>
            <div className="step-content">
              <h3>Completed</h3>
              <p>Enter final odometer and fuel consumed. Vehicle and driver automatically restored to <strong>Available</strong>.</p>
            </div>
          </div>
          <div className="workflow-step">
            <div className="step-indicator">
              <div className="step-dot"></div>
            </div>
            <div className="step-content">
              <h3>Cancelled</h3>
              <p>Cancelling a dispatched trip restores both the vehicle and driver back to <strong>Available</strong> status.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="industries-section">
        <span className="section-label">INDUSTRIES</span>
        <h2 className="section-title-serif">
          Built for teams that <span className="accent-word">move things.</span>
        </h2>
        <div className="industries-grid">
          <div className="industry-card">
            <h3>Third-Party Logistics</h3>
            <p>Multi-fleet management, driver assignment, and cost tracking across multiple clients and warehouses.</p>
          </div>
          <div className="industry-card">
            <h3>E-commerce & Retail</h3>
            <p>Last-mile delivery management with trip tracking, driver utilization, and fuel cost optimization.</p>
          </div>
          <div className="industry-card">
            <h3>Manufacturing & Distribution</h3>
            <p>Coordinate raw material transport, finished goods delivery, and maintenance schedules for factory fleets.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <span className="section-label">FAQ</span>
        <h2 className="section-title-serif">
          Common <span className="accent-word">questions.</span>
        </h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>What roles are supported?</summary>
            <p>TransitOps supports four roles: Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst. Each role has tailored access to the platform.</p>
          </details>
          <details className="faq-item">
            <summary>How does automatic status transition work?</summary>
            <p>When a trip is dispatched, both the vehicle and driver automatically switch to "On Trip" status. Completing or cancelling restores them to "Available". Maintenance records auto-set vehicles to "In Shop".</p>
          </details>
          <details className="faq-item">
            <summary>What business rules are enforced?</summary>
            <p>Cargo weight cannot exceed vehicle capacity. Expired-license or suspended drivers cannot be dispatched. Retired or In-Shop vehicles are hidden from dispatch. No double-booking of vehicles or drivers.</p>
          </details>
          <details className="faq-item">
            <summary>Can I export reports?</summary>
            <p>Yes. The analytics page supports CSV export of all trips, vehicles, drivers, expenses, and maintenance records in a single downloadable file.</p>
          </details>
          <details className="faq-item">
            <summary>How is fuel efficiency calculated?</summary>
            <p>Fuel efficiency is calculated as Total Distance (km) divided by Total Fuel Consumed (liters) across all completed trips, giving you a km/L metric for your fleet.</p>
          </details>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2 className="footer-title">
          <span className="serif-italic">Ready when</span><br/>
          <span className="accent-word serif-italic">your fleet is.</span>
        </h2>
        <p className="footer-desc">
          Start managing your transport operations today—vehicles, drivers, trips, and analytics all in one place.
        </p>
        <div className="hero-buttons">
          <Link href="/register" className="btn-primary">
            Start your trial <span className="arrow">↗</span>
          </Link>
          <Link href="/login" className="btn-secondary">
            Explore platform
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2026 TRANSITOPS</span>
        <div className="footer-links">
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
          <a href="#">CONTACT</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </div>
  );
}
