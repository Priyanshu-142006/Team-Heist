import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const COLORS = {
  saffron: "#FF6B00",
  deepSaffron: "#CC5200",
  saffronGlow: "#FFF0E6",
  indiaGreen: "#1A7F4B",
  mintMist: "#E6F7EE",
  warmIvory: "#FDF8F2",
  charcoal: "#1A1A1A",
  slate: "#6B7280",
  ash: "#9CA3AF",
  alertRed: "#D93025",
  blushRed: "#FEE8E7",
  amberGold: "#F59E0B",
  warmSand: "#E5E0D8",
};

// ─────────────────────────────────────────────
// FIX: REAL DEMO CREDENTIALS — any email not in map is rejected
// ─────────────────────────────────────────────
const DEMO_USERS = {
  "admin@bharatmap.in":  { role: "admin",      password: "admin123",   name: "Platform Admin" },
  "hotel@demo.in":       { role: "restaurant", password: "hotel123",   name: "Hotel Chanakya", location: { address: "12-B, Main Road, Lalpur, Ranchi - 834001", lat: "23.3441° N", lng: "85.3096° E", landmark: "Near Lalpur Chowk, opposite State Bank ATM", phone: "+91 98765 43210", hours: "Mon–Sat: 10am–10pm" } },
  "ngo@shelter.org":     { role: "ngo",         password: "ngo123",     name: "Jharkhand Seva NGO", regNo: "NGO/2023/JH/0042" },
};

// FIXED: Real Unsplash food photos — specific photo IDs, CORS-safe, no API key needed
const FOOD_PHOTOS = {
  "Cooked Meal": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format",
  "Bakery":      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop&auto=format",
  "Produce":     "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop&auto=format",
  "Sweets":      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&auto=format",
  "Snacks":      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop&auto=format",
};

// Gradient backgrounds per food type — used when image fails (always visible)
const FOOD_GRADIENTS = {
  "Cooked Meal": "linear-gradient(135deg, #FF6B00 0%, #FF8C42 50%, #FFC107 100%)",
  "Bakery":      "linear-gradient(135deg, #C8860A 0%, #D4A843 50%, #F5D78E 100%)",
  "Produce":     "linear-gradient(135deg, #1A7F4B 0%, #2ECC71 50%, #A8E6CF 100%)",
  "Sweets":      "linear-gradient(135deg, #9B59B6 0%, #C39BD3 50%, #F8C8D4 100%)",
  "Snacks":      "linear-gradient(135deg, #E74C3C 0%, #F0A500 50%, #F9E4B7 100%)",
  "default":     "linear-gradient(135deg, #FF6B00 0%, #FFC107 100%)",
};

// ─────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────
const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Trebuchet MS', Georgia, sans-serif; background: ${COLORS.warmIvory}; }
  button { font-family: inherit; }
  input, select, textarea { font-family: inherit; }

  @keyframes floatUp    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(10deg)} }
  @keyframes blobMorph  { 0%,100%{border-radius:60% 40% 70% 30%/50% 60% 40% 50%;transform:scale(1)} 33%{border-radius:30% 60% 40% 70%/60% 30% 70% 40%;transform:scale(1.05)} 66%{border-radius:50% 50% 30% 70%/40% 70% 60% 30%;transform:scale(0.98)} }
  @keyframes urgentPulse{ 0%,100%{opacity:1} 50%{opacity:0.6} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes pinDrop    { from{transform:translate(-50%,-200%) scale(0.5);opacity:0} to{transform:translate(-50%,-100%) scale(1);opacity:1} }
  @keyframes userPulse  { 0%,100%{box-shadow:0 0 0 4px rgba(26,127,75,0.2),0 0 0 8px rgba(26,127,75,0.08)} 50%{box-shadow:0 0 0 8px rgba(26,127,75,0.2),0 0 0 16px rgba(26,127,75,0.08)} }
  @keyframes bounceIn   { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 80%{transform:scale(0.95)} 100%{transform:scale(1)} }
  @keyframes floatCard  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes slideDown  { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes heroFloat  { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-12px) rotate(2deg)} }
  @keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes confettiFall { to{transform:translateY(110vh) rotate(720deg);opacity:0} }
  @keyframes darkToggle { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }

  .hero-card { animation: heroFloat 6s ease-in-out infinite; }

  ::-webkit-scrollbar       { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.warmSand}; border-radius: 3px; }

  /* FoodCard — pure CSS hover (fixes stuck-hover bug) */
  .food-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s; }
  .food-card:not(.expired):hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 20px 60px rgba(0,0,0,0.14) !important; }

  /* HOW IT WORKS — bigger font sizes */
  .howto-title { font-size: 42px !important; }
  .howto-section-title { font-size: 20px !important; }
  .howto-step-text { font-size: 16px !important; }
  .howto-step-num { font-size: 18px !important; width: 44px !important; height: 44px !important; }

  @media (max-width: 900px) {
    .landing-hero   { flex-direction: column !important; padding: 32px 24px 24px !important; }
    .landing-hero > div:last-child { display: none !important; }
    .landing-stats  { flex-wrap: wrap !important; padding: 24px !important; }
    .landing-stats > div { min-width: 40% !important; margin-bottom: 16px; text-align: center; }
    .landing-grid3  { grid-template-columns: 1fr !important; }
    .landing-howto  { grid-template-columns: 1fr !important; gap: 32px !important; }
    .landing-footer-cols { flex-direction: column !important; gap: 24px !important; }
    .dash-layout    { flex-direction: column !important; height: auto !important; }
    .dash-sidebar   { width: 100% !important; flex-direction: row !important; overflow-x: auto; }
    .browse-layout  { flex-direction: column !important; }
    .res-grid4      { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 600px) {
    .landing-stats > div { min-width: 100% !important; }
    .res-grid4 { grid-template-columns: 1fr !important; }
    .modal-inner { width: 96vw !important; }
    .dash-layout { height: auto !important; }
    .dash-sidebar { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; top: auto !important; width: 100% !important; height: 64px !important; flex-direction: row !important; border-right: none !important; border-top: 1px solid ${COLORS.warmSand} !important; z-index: 200 !important; overflow-x: auto; overflow-y: hidden; }
    .dash-main-content { padding-bottom: 72px !important; }
    .howto-title { font-size: 28px !important; }
  }
`;

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
const parseQty  = (q) => { const n = parseFloat(q); return isNaN(n) ? 0 : n; };
const parseDist = (d) => { const n = parseFloat(d); return isNaN(n) ? Infinity : n; };
const formatTime = (mins) => {
  if (mins == null || isNaN(mins)) return "Unknown";
  if (mins <= 0) return "Expired";
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
};
// FIX: crypto.getRandomValues for unpredictable codes; 6-char alphanumeric = 36^6 space
const genPickupCode = () => {
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "BM-" + Array.from(arr).map(b => chars[b % 36]).join("");
};
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
};

// ─────────────────────────────────────────────
// SEED DATA — with photoUrl for realism
// ─────────────────────────────────────────────
const INITIAL_LISTINGS = [
  { id: 1, name: "Paneer Butter Masala",  donor: "Hotel Chanakya",     type: "Cooked Meal", qty: "25 portions", urgent: true,  dist: "0.8 km", img: "🍛", photoUrl: FOOD_PHOTOS["Cooked Meal"], rating: 4.8, expiry: 72,  reserved: false },
  { id: 2, name: "Jeera Rice + Dal Fry",  donor: "Saffron Restaurant", type: "Cooked Meal", qty: "40 portions", urgent: false, dist: "1.4 km", img: "🍚", photoUrl: FOOD_PHOTOS["Cooked Meal"], rating: 4.6, expiry: 165, reserved: false },
  { id: 3, name: "Assorted Bread Rolls",  donor: "Baker's Den",        type: "Bakery",      qty: "60 pieces",   urgent: false, dist: "2.1 km", img: "🍞", photoUrl: FOOD_PHOTOS["Bakery"],      rating: 4.9, expiry: 200, reserved: false },
  { id: 4, name: "Mixed Veg Curry",       donor: "Green Dhaba",        type: "Cooked Meal", qty: "18 portions", urgent: true,  dist: "0.5 km", img: "🥘", photoUrl: FOOD_PHOTOS["Cooked Meal"], rating: 4.7, expiry: 45,  reserved: false },
  { id: 5, name: "Fresh Fruit Basket",    donor: "Ranchi Market Co.",  type: "Produce",     qty: "15 kg",       urgent: false, dist: "3.2 km", img: "🍎", photoUrl: FOOD_PHOTOS["Produce"],     rating: 4.5, expiry: 300, reserved: false },
  { id: 6, name: "Gulab Jamun + Kheer",   donor: "Mithai Palace",      type: "Sweets",      qty: "30 portions", urgent: true,  dist: "1.1 km", img: "🍮", photoUrl: FOOD_PHOTOS["Sweets"],      rating: 4.9, expiry: 115, reserved: false },
];

const MAP_PINS = [
  { x: 38, y: 35, label: "Paneer Masala",  urgent: true,  color: "#D93025" },
  { x: 62, y: 48, label: "Jeera Rice",     urgent: false, color: "#FF6B00" },
  { x: 25, y: 60, label: "Bread Rolls",    urgent: false, color: "#FF6B00" },
  { x: 70, y: 25, label: "Mixed Veg",      urgent: true,  color: "#D93025" },
  { x: 50, y: 70, label: "Fruit Basket",   urgent: false, color: "#1A7F4B" },
  { x: 80, y: 58, label: "Sweets",         urgent: true,  color: "#D93025" },
  { x: 45, y: 50, label: "YOU",            urgent: false, color: "#1A7F4B", isUser: true },
];

// ─────────────────────────────────────────────
// SMALL THUMBNAIL — React-state image fallback (replaces DOM mutation pattern)
// ─────────────────────────────────────────────
function SmallThumb({ listing, size = 48, borderRadius = 10, fontSize = 26 }) {
  const [err, setErr] = useState(false);
  const bg = FOOD_GRADIENTS[listing.type] || FOOD_GRADIENTS["default"];
  return (
    <div style={{ width: size, height: size, borderRadius, overflow: "hidden", flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {listing.photoUrl && !err ? (
        <img loading="lazy" src={listing.photoUrl} alt={listing.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setErr(true)} />
      ) : (
        <span style={{ fontSize }}>{listing.img}</span>
      )}
    </div>
  );
}

// Generic image with emoji fallback — state-based, no DOM mutation
function ImgWithFallback({ src, alt, fallbackEmoji = "🍽", style }) {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(style?.height || 48, 48) }}>
      {fallbackEmoji}
    </div>
  );
  return <img loading="lazy" src={src} alt={alt} style={style} onError={() => setErr(true)} />;
}

({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer",
        background: dark ? "#2a2a40" : COLORS.saffronGlow,
        color: dark ? "#FFD700" : COLORS.saffron,
        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s", animation: "darkToggle 0.2s ease",
      }}
    >{dark ? "☀️" : "🌙"}</button>
  );
}

// ─────────────────────────────────────────────
// SMALL PRESENTATIONAL COMPONENTS
// ─────────────────────────────────────────────
function FloatingParticle({ color, width, height, top, left, duration, delay }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%", opacity: 0.12,
      background: color, width, height, top, left,
      animation: `floatUp ${duration}s ease-in-out infinite`,
      animationDelay: delay, pointerEvents: "none",
    }} />
  );
}

function GravityBlob({ color, size, top, left, delay = "0s" }) {
  return (
    <div style={{
      position: "absolute", top, left,
      width: size, height: size,
      background: color,
      borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%",
      opacity: 0.08, filter: "blur(40px)",
      animation: "blobMorph 8s ease-in-out infinite",
      animationDelay: delay, pointerEvents: "none",
    }} />
  );
}

function CountdownBadge({ expiry }) {
  const time     = formatTime(expiry);
  const isUrgent = typeof expiry === "number" && expiry > 0 && expiry < 90;
  const color    = !expiry || expiry <= 0
    ? COLORS.ash
    : expiry < 60  ? COLORS.alertRed
    : expiry < 120 ? COLORS.amberGold
    : COLORS.indiaGreen;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 999,
      background: !expiry || expiry <= 0 ? COLORS.warmSand : isUrgent ? COLORS.blushRed : "#fff8e6",
      color, fontSize: 12, fontWeight: 700,
      border: `1px solid ${color}20`,
      animation: isUrgent ? "urgentPulse 2s ease-in-out infinite" : "none",
      flexShrink: 0,
    }}>
      ⏱ {time}
    </div>
  );
}

// ─────────────────────────────────────────────
// FOOD CARD — realistic photo + CSS hover fix
// ─────────────────────────────────────────────
const FoodCard = memo(function FoodCard({ listing, onReserve, disabled }) {
  const isExpired  = listing.expiry <= 0;
  const isReserved = listing.reserved;
  const blocked    = isExpired || isReserved;
  // FIX: Track image load failure with React state (not DOM mutation)
  const [imgError, setImgError] = useState(false);
  const bgGradient = FOOD_GRADIENTS[listing.type] || FOOD_GRADIENTS["default"];

  return (
    <div
      role="article"
      aria-label={`${listing.name} from ${listing.donor}`}
      className={`food-card${blocked ? " expired" : ""}`}
      style={{
        background: "#fff", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        cursor: blocked ? "not-allowed" : "pointer",
        border: listing.urgent && !blocked ? `1.5px solid ${COLORS.alertRed}30` : "1.5px solid transparent",
        position: "relative",
        opacity: blocked ? 0.6 : 1,
      }}
    >
      {/* Status ribbons */}
      {isReserved && (
        <div style={{ position: "absolute", top: 14, left: -1, zIndex: 10, background: COLORS.indiaGreen, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 10px 3px 8px", borderRadius: "0 6px 6px 0" }}>RESERVED</div>
      )}
      {!isReserved && listing.urgent && !isExpired && (
        <div style={{ position: "absolute", top: 14, left: -1, zIndex: 10, background: COLORS.alertRed, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 10px 3px 8px", borderRadius: "0 6px 6px 0", animation: "urgentPulse 2s ease-in-out infinite" }}>URGENT</div>
      )}
      {isExpired && !isReserved && (
        <div style={{ position: "absolute", top: 14, left: -1, zIndex: 10, background: COLORS.ash, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 10px 3px 8px", borderRadius: "0 6px 6px 0" }}>EXPIRED</div>
      )}

      {/* Food image — gradient bg always visible; real photo overlaid if available */}
      <div style={{ height: 160, position: "relative", overflow: "hidden", background: bgGradient }}>
        {listing.photoUrl && !imgError ? (
          <img
            src={listing.photoUrl}
            alt={listing.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          /* FIX: Emoji fallback always renders on error or missing URL */
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", fontSize: 72, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
            userSelect: "none",
          }}>{listing.img}</div>
        )}
        <div style={{ position: "absolute", bottom: 10, right: 10 }}>
          <CountdownBadge expiry={listing.expiry} />
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.charcoal, marginBottom: 6, fontFamily: "Georgia, serif" }}>{listing.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.saffronGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.saffron, flexShrink: 0 }}>{listing.donor[0]}</div>
          <span style={{ fontSize: 12, color: COLORS.slate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.donor}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.amberGold, fontWeight: 600, flexShrink: 0 }}>★ {listing.rating}</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {[`📦 ${listing.qty}`, `📍 ${listing.dist}`, `🍽 ${listing.type}`].map(tag => (
            <span key={tag} style={{ padding: "3px 8px", borderRadius: 999, background: COLORS.warmIvory, border: `1px solid ${COLORS.warmSand}`, fontSize: 11, color: COLORS.slate }}>{tag}</span>
          ))}
        </div>
        <button
          disabled={disabled || blocked}
          onClick={() => { if (!disabled && !blocked) onReserve(listing); }}
          aria-label={isExpired ? `${listing.name} — expired` : isReserved ? `${listing.name} — already reserved` : `Reserve ${listing.name}`}
          style={{
            width: "100%", padding: "10px 0",
            background: blocked ? COLORS.warmSand : listing.urgent ? `linear-gradient(135deg, ${COLORS.alertRed}, #b02020)` : `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`,
            color: blocked ? COLORS.ash : "#fff",
            border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: disabled || blocked ? "not-allowed" : "pointer",
            transition: "opacity 0.1s ease", letterSpacing: 0.3,
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {isReserved ? "✓ Reserved" : isExpired ? "Expired" : listing.urgent ? "⚡ Reserve Now" : "Reserve →"}
        </button>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────
// IMMERSIVE MAP
// ─────────────────────────────────────────────
function ImmersiveMap({ selectedPin, onPinClick }) {
  const [tooltip, setTooltip] = useState(null);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 20, overflow: "hidden", background: "linear-gradient(145deg, #e8f4f0 0%, #d4eae2 30%, #c8dfd4 60%, #b8d4c8 100%)" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
        {[10,20,30,40,50,60,70,80,90].map(v => (
          <g key={v}>
            <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="#1A7F4B" strokeWidth="0.5" strokeDasharray="4,8" />
            <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#1A7F4B" strokeWidth="0.5" strokeDasharray="4,8" />
          </g>
        ))}
      </svg>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
        <path d="M 0 50% Q 30% 35% 50% 50% T 100% 55%" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 20% 0 Q 40% 40% 45% 50% T 60% 100%" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 0 75% L 100% 70%" stroke="#fff" strokeWidth="3" fill="none" />
        <path d="M 55% 0 L 65% 100%" stroke="#fff" strokeWidth="3" fill="none" />
      </svg>
      {[{ x: "15%", y: "20%", label: "Ranchi Hill" }, { x: "68%", y: "15%", label: "Harmu" }, { x: "75%", y: "72%", label: "Lalpur" }, { x: "12%", y: "78%", label: "Doranda" }].map(n => (
        <div key={n.label} style={{ position: "absolute", left: n.x, top: n.y, fontSize: 9, fontWeight: 600, color: "#1A7F4B", opacity: 0.5, letterSpacing: 1, textTransform: "uppercase", pointerEvents: "none" }}>{n.label}</div>
      ))}
      {MAP_PINS.map((pin, i) => (
        <div key={pin.label} onMouseEnter={() => setTooltip(pin)} onMouseLeave={() => setTooltip(null)} onClick={() => onPinClick && onPinClick(pin)}
          style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)", cursor: "pointer", zIndex: pin.isUser ? 20 : 10, animation: "pinDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both", animationDelay: `${i * 0.1}s` }}>
          {pin.isUser ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.indiaGreen, border: "3px solid #fff", boxShadow: "0 0 0 6px rgba(26,127,75,0.2), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 800, animation: "userPulse 2s ease-in-out infinite" }}>👤</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.indiaGreen, marginTop: 2 }}>YOU</div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 28, height: 28, background: pin.color, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", border: "2px solid #fff", boxShadow: `0 4px 12px ${pin.color}60`, animation: pin.urgent ? "urgentPulse 2s ease-in-out infinite" : "none" }}>
                <div style={{ transform: "rotate(45deg)", fontSize: 12, lineHeight: "24px", textAlign: "center" }}>🍽</div>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: pin.color, margin: "0 auto" }} />
            </div>
          )}
        </div>
      ))}
      {tooltip && !tooltip.isUser && (
        <div style={{ position: "absolute", left: `${tooltip.x}%`, top: `calc(${tooltip.y}% - 80px)`, transform: "translateX(-50%)", background: "#1A1A1A", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 30, pointerEvents: "none" }}>
          {tooltip.urgent && <span style={{ color: COLORS.alertRed }}>⚡ </span>}{tooltip.label}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "8px 12px", display: "flex", gap: 12, fontSize: 10, fontWeight: 600 }}>
        <span style={{ color: COLORS.alertRed }}>● Urgent</span>
        <span style={{ color: COLORS.saffron }}>● Available</span>
        <span style={{ color: COLORS.indiaGreen }}>● Safe</span>
      </div>
      <div style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, background: "rgba(255,255,255,0.92)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>🧭</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN MODAL — FIX: real credential validation + reg no validated
// ─────────────────────────────────────────────
function LoginModal({ role, onClose, onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [regNo,    setRegNo]    = useState("");
  const [error,    setError]    = useState("");
  const [animIn,   setAnimIn]   = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { setAnimIn(true); firstInputRef.current?.focus(); }, 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const configs = {
    admin:      { icon: "🛡️", color: "#4F46E5", bg: "linear-gradient(135deg,#4F46E5,#7C3AED)", label: "Admin Portal",       sub: "Platform control & oversight",   hint: "admin@bharatmap.in / admin123" },
    restaurant: { icon: "🍽️", color: COLORS.saffron, bg: `linear-gradient(135deg,${COLORS.saffron},${COLORS.deepSaffron})`, label: "Restaurant / Donor", sub: "List your surplus food",          hint: "hotel@demo.in / hotel123" },
    ngo:        { icon: "🤝", color: COLORS.indiaGreen, bg: `linear-gradient(135deg,${COLORS.indiaGreen},#0d5c35)`,          label: "NGO / Shelter",      sub: "Access food for your community",  hint: "ngo@shelter.org / ngo123" },
  };
  const c = configs[role];

  const handleSubmit = useCallback(() => {
    if (!email.trim())    { setError("Email is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }

    // FIX: actual credential check
    const user = DEMO_USERS[email.toLowerCase().trim()];
    if (!user || user.password !== password) { setError("Invalid email or password. Check the hint below."); return; }
    if (user.role !== role) { setError(`This account is for ${user.role} login, not ${role}.`); return; }

    // FIX: NGO reg no validated (not just shown)
    if (role === "ngo") {
      const trimmedReg = regNo.trim();
      if (!trimmedReg) { setError("NGO Registration Number is required."); return; }
      if (trimmedReg !== user.regNo) { setError("Invalid NGO Registration Number."); return; }
    }

    setError("");
    onLogin(role, email);
  }, [email, password, regNo, role, onLogin]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`${c.label} login`}
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", animation: "fadeIn 0.3s ease" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-inner" style={{ width: 420, background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.3)", transform: animIn ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)", opacity: animIn ? 1 : 0, transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ background: c.bg, padding: "32px 32px 28px", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>{c.icon}</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{c.label}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>{c.sub}</div>
          <button onClick={onClose} aria-label="Close login modal" style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: "28px 32px 32px" }}>
          <div style={{ fontSize: 11, color: COLORS.slate, background: COLORS.warmIvory, borderRadius: 8, padding: "6px 10px", marginBottom: 16 }}>
            💡 Demo: <strong>{c.hint}</strong>{role === "ngo" ? " · Reg: NGO/2023/JH/0042" : ""}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 6, letterSpacing: 0.5 }}>EMAIL ADDRESS</label>
            <input ref={firstInputRef} type="email" placeholder={c.hint.split("/")[0].trim()} value={email} maxLength={100}
              onChange={e => { setError(""); setEmail(e.target.value.slice(0, 100)); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = c.color}
              onBlur={e => e.target.style.borderColor = COLORS.warmSand} />
          </div>
          <div style={{ marginBottom: role === "ngo" ? 16 : 0 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 6, letterSpacing: 0.5 }}>PASSWORD</label>
            <input type="password" placeholder="Your password" value={password} maxLength={64} autoComplete="current-password"
              onChange={e => { setError(""); setPassword(e.target.value.slice(0, 64)); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = c.color}
              onBlur={e => e.target.style.borderColor = COLORS.warmSand} />
          </div>
          {role === "ngo" && (
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 6, letterSpacing: 0.5 }}>NGO REGISTRATION NO. *</label>
              <input placeholder="NGO/2023/JH/0042" value={regNo} maxLength={30}
                onChange={e => { setError(""); setRegNo(e.target.value); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = c.color}
                onBlur={e => e.target.style.borderColor = COLORS.warmSand} />
            </div>
          )}
          {error && (
            <div role="alert" style={{ fontSize: 12, color: COLORS.alertRed, marginTop: 12, padding: "8px 12px", background: COLORS.blushRed, borderRadius: 8 }}>{error}</div>
          )}
          <button onClick={handleSubmit}
            style={{ width: "100%", padding: "14px", marginTop: 20, background: c.bg, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 24px ${c.color}40`, transition: "transform 0.1s, box-shadow 0.1s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            aria-label="Sign in">
            Sign in →
          </button>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: COLORS.ash }}>
            Trouble signing in? <span style={{ color: c.color, cursor: "pointer" }}>Contact support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`,
    color: [COLORS.saffron, COLORS.indiaGreen, COLORS.amberGold, COLORS.alertRed, "#7C3AED"][i % 5],
    delay: `${Math.random() * 0.8}s`, duration: `${1.2 + Math.random() * 1.2}s`,
    size: 6 + Math.random() * 8,
  })), []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2000, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position: "absolute", top: "-20px", left: p.left, width: p.size, height: p.size, background: p.color, borderRadius: "2px", animation: `confettiFall ${p.duration} ease-in ${p.delay} forwards` }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// CODE VERIFICATION MODAL — FIX: new feature from todo
// ─────────────────────────────────────────────
function VerifyCodeModal({ reservations, onClose }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleVerify = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const match = reservations.find(r => r.code === trimmed);
    setResult(match ? { found: true, reservation: match } : { found: false });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Verify pickup code"
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-inner" style={{ width: 420, background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.25)", transform: animIn ? "scale(1)" : "scale(0.9)", opacity: animIn ? 1 : 0, transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.indiaGreen}, #0d5c35)`, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, fontFamily: "Georgia, serif" }}>🔍 Verify Pickup Code</div>
          <button onClick={onClose} aria-label="Close" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ fontSize: 13, color: COLORS.slate, marginBottom: 16 }}>Enter the NGO's pickup code to confirm food collection.</div>
          <input
            placeholder="e.g. BM-XKRT72"
            value={code}
            maxLength={9}
            onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")); setResult(null); }}
            onKeyDown={e => e.key === "Enter" && handleVerify()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 16, outline: "none", fontFamily: "monospace", letterSpacing: 2, boxSizing: "border-box", marginBottom: 12 }}
            onFocus={e => e.target.style.borderColor = COLORS.indiaGreen}
            onBlur={e => e.target.style.borderColor = COLORS.warmSand}
          />
          <button onClick={handleVerify} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg, ${COLORS.indiaGreen}, #0d5c35)`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Verify Code →</button>
          {result && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: result.found ? COLORS.mintMist : COLORS.blushRed, border: `1px solid ${result.found ? COLORS.indiaGreen : COLORS.alertRed}30` }}>
              {result.found ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.indiaGreen, marginBottom: 8 }}>✅ Valid Code — Confirmed!</div>
                  <div style={{ fontSize: 13, color: COLORS.charcoal }}><strong>{result.reservation.listing.name}</strong></div>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 4 }}>{result.reservation.listing.qty} · Reserved at {result.reservation.time}</div>
                  <div style={{ fontSize: 11, color: COLORS.indiaGreen, marginTop: 4, fontWeight: 600 }}>Please hand over the food and mark as collected.</div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: COLORS.alertRed, fontWeight: 600 }}>❌ Code not found. Please check and try again.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESERVE MODAL — FIX: auth check, expiry guard, deduplication handled by caller
// ─────────────────────────────────────────────
function ReserveModal({ listing, onClose, onConfirmed }) {
  const [step,   setStep]   = useState(1);
  const [animIn, setAnimIn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const pickupCode = useRef(genPickupCode()).current;

  useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && step !== 3) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, onClose]);

  const handleAssign = () => {
    setStep(3);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    if (onConfirmed) onConfirmed({ listing, code: pickupCode });
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <div role="dialog" aria-modal="true" aria-label="Reserve food"
        style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
        onClick={e => e.target === e.currentTarget && step !== 3 && onClose()}>
        <div className="modal-inner" style={{ width: 440, background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.25)", transform: animIn ? "scale(1)" : "scale(0.9)", opacity: animIn ? 1 : 0, transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <div style={{ background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, padding: "24px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Georgia, serif" }}>Reserve Food</div>
              {step < 3 && <button onClick={onClose} aria-label="Close reservation modal" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer" }}>✕</button>}
            </div>
            <div style={{ marginTop: 8, opacity: 0.85, fontSize: 14 }}>{listing.name} · {listing.donor}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? "#fff" : "rgba(255,255,255,0.3)", transition: "background 0.3s" }} />
              ))}
            </div>
          </div>
          <div style={{ padding: "28px 28px 24px" }}>
            {step === 1 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, fontFamily: "Georgia, serif" }}>Confirm your pickup details</div>
                <div style={{ padding: 16, background: COLORS.warmIvory, borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[["Food", listing.name], ["Quantity", listing.qty], ["Pickup", `${listing.dist} away`], ["Expires in", formatTime(listing.expiry)]].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: COLORS.ash, fontWeight: 600, letterSpacing: 0.5 }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.charcoal, marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setStep(2)} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Confirm Reservation →</button>
              </div>
            )}
            {step === 2 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, fontFamily: "Georgia, serif" }}>Assign volunteer (optional)</div>
                <div style={{ padding: 16, background: COLORS.mintMist, borderRadius: 12, border: `1px solid ${COLORS.indiaGreen}30`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: COLORS.indiaGreen, fontWeight: 600 }}>✓ 3 volunteers available in your area</div>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 4 }}>BharatMap will auto-assign the nearest volunteer</div>
                </div>
                <button onClick={handleAssign} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Assign & Proceed →</button>
              </div>
            )}
            {step === 3 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 12, animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>🎉</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.charcoal, fontFamily: "Georgia, serif" }}>Reserved!</div>
                <div style={{ fontSize: 14, color: COLORS.slate, marginTop: 8, marginBottom: 20 }}>Your pickup code is ready. Show it at the location.</div>
                <div style={{ padding: "16px 24px", background: COLORS.saffronGlow, borderRadius: 14, border: `2px dashed ${COLORS.saffron}`, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: COLORS.saffron, fontWeight: 700, letterSpacing: 2 }}>PICKUP CODE</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.saffron, letterSpacing: 6, fontFamily: "monospace" }}>{pickupCode}</div>
                </div>
                <button onClick={onClose} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${COLORS.indiaGreen}, #0d5c35)`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Done ✓</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// BROWSE PAGE
// ─────────────────────────────────────────────
function BrowsePage({ listings, onReserve, reserveItem, onConfirmed, embedded, userRole }) {
  const [sortBy,       setSortBy]       = useState("expiring");
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [selectedPin,  setSelectedPin]  = useState(null);
  const [localReserve, setLocalReserve] = useState(null);

  const handleReserve = useCallback((listing) => {
    // Public browse (no userRole): show login prompt
    if (!userRole) {
      if (onReserve) onReserve(listing); // triggers login modal in parent
      return;
    }
    // NGO can reserve — guard: expiry + reserved status
    if (listing.expiry <= 0) return;
    if (listing.reserved) return;
    if (onReserve) {
      onReserve(listing);
    } else {
      setLocalReserve(listing);
    }
  }, [onReserve, userRole]);

  const activeModal = reserveItem || localReserve;

  const sortOptions = [
    { value: "expiring",  label: "⏱ Expiring Soonest" },
    { value: "distance",  label: "📍 Nearest First" },
    { value: "quantity",  label: "📦 Most Quantity" },
    { value: "rating",    label: "★ Highest Rated" },
    { value: "newest",    label: "🆕 Newest Listed" },
    { value: "veg",       label: "🌿 Vegetarian First" },
  ];
  const filterChips = [
    { id: "all",    label: "All" },
    { id: "urgent", label: "🔴 Urgent" },
    { id: "fresh",  label: "🌿 Fresh" },
    { id: "cooked", label: "🍛 Cooked" },
    { id: "bakery", label: "🍞 Bakery" },
  ];

  const sorted = useMemo(() => {
    const base = Array.isArray(listings) ? listings : [];
    return [...base]
      .filter(l => {
        if (filter === "urgent") return l.urgent && l.expiry > 0;
        if (filter === "fresh")  return !l.urgent && l.expiry > 0;
        if (filter === "cooked") return l.type === "Cooked Meal" && l.expiry > 0;
        if (filter === "bakery") return l.type === "Bakery" && l.expiry > 0;
        return true;
      })
      .filter(l => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return l.name.toLowerCase().includes(q) || l.donor.toLowerCase().includes(q) || l.type.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "expiring":  {
            // Expired items sink to bottom
            const aExp = a.expiry <= 0 ? Infinity : a.expiry;
            const bExp = b.expiry <= 0 ? Infinity : b.expiry;
            return aExp - bExp;
          }
          case "distance":  return parseDist(a.dist) - parseDist(b.dist);
          case "quantity":  return parseQty(b.qty) - parseQty(a.qty);
          case "rating":    return b.rating - a.rating;
          case "newest":    return b.id - a.id;
          case "veg": {
            const vegTypes = ["Produce", "Sweets", "Bakery"];
            return (vegTypes.includes(a.type) ? 0 : 1) - (vegTypes.includes(b.type) ? 0 : 1);
          }
          default: return 0;
        }
      });
  }, [listings, sortBy, filter, search]);

  return (
    <div className="browse-layout" style={{ display: "flex", gap: 20, height: embedded ? "calc(100vh - 180px)" : "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 12, border: `1px solid ${COLORS.warmSand}` }}>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search food, donor, type…" aria-label="Search listings"
            autoComplete="off"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10, transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = COLORS.saffron}
            onBlur={e => e.target.style.borderColor = COLORS.warmSand} />
          <div role="group" aria-label="Filter listings" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {filterChips.map(chip => (
              <button key={chip.id} onClick={() => setFilter(chip.id)} aria-pressed={filter === chip.id}
                style={{ padding: "5px 12px", borderRadius: 999, background: filter === chip.id ? COLORS.saffron : "#fff", color: filter === chip.id ? "#fff" : COLORS.slate, border: `1.5px solid ${filter === chip.id ? COLORS.saffron : COLORS.warmSand}`, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: COLORS.slate, marginBottom: 10, paddingLeft: 2 }}>
          {sorted.length} listing{sorted.length !== 1 ? "s" : ""} · Ranchi, Jharkhand
          {search && <span style={{ color: COLORS.saffron }}> for "{search}"</span>}
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: COLORS.slate }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.charcoal }}>No listings found</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or filter</div>
              {search && <button onClick={() => setSearch("")} style={{ marginTop: 12, padding: "8px 16px", background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Clear search</button>}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {sorted.map(l => (
                <FoodCard key={l.id} listing={l} onReserve={handleReserve} disabled={!!activeModal} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ flex: 1, minHeight: 320, borderRadius: 20, overflow: "hidden", border: `1px solid ${COLORS.warmSand}` }}>
          <ImmersiveMap selectedPin={selectedPin} onPinClick={setSelectedPin} />
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.warmSand}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.slate, letterSpacing: 1, marginBottom: 8 }}>SORT BY</div>
          <div role="group" aria-label="Sort options" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sortOptions.map(opt => (
              <button key={opt.value} onClick={() => setSortBy(opt.value)} aria-pressed={sortBy === opt.value}
                style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: sortBy === opt.value ? COLORS.saffronGlow : "transparent", color: sortBy === opt.value ? COLORS.saffron : COLORS.slate, fontWeight: sortBy === opt.value ? 700 : 500, fontSize: 12, textAlign: "left", cursor: "pointer", borderLeft: sortBy === opt.value ? `3px solid ${COLORS.saffron}` : "3px solid transparent", transition: "all 0.15s" }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {localReserve && (
        <ReserveModal listing={localReserve} onClose={() => setLocalReserve(null)} onConfirmed={onConfirmed} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// NGO DASHBOARD — FIX: all audit + todo issues
// ─────────────────────────────────────────────
function NGODashboard({ listings, setListings, onLogout, dark, onToggleDark, sharedReservations = [], onSharedReservation, ngoName = "Jharkhand Seva NGO" }) {
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [reserveItem,  setReserveItem]  = useState(null);
  const [reservations, setReservations] = useState([]);
  const [notifPrefs,   setNotifPrefs]   = useState({ urgent: true, newListings: true, reminders: true });

  const reservingRef = useRef(false);

  const urgentCount = useMemo(() => listings.filter(l => l.urgent && l.expiry > 0).length, [listings]);

  // Dedup + expiry guard + race lock + sync to shared state for restaurant verification
  // FIX: side-effect (onSharedReservation) pulled out of setState callback via pendingShareRef
  const pendingShareRef = useRef(null);
  const handleReserved = useCallback(({ listing, code }) => {
    const newEntry = { listing, code, time: new Date().toLocaleTimeString(), status: "confirmed" };
    setReservations(prev => {
      if (prev.some(r => r.listing.id === listing.id)) return prev;
      const updated = [newEntry, ...prev];
      pendingShareRef.current = updated; // stage for useEffect
      return updated;
    });
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, reserved: true } : l));
    setActiveTab("reservations");
  }, [setListings]);

  // Flush shared state after render — never inside a setState callback
  useEffect(() => {
    if (pendingShareRef.current && onSharedReservation) {
      onSharedReservation(pendingShareRef.current);
      pendingShareRef.current = null;
    }
  });

  // FIX: auth + expiry guard + race lock
  const handleReserveItem = useCallback((listing) => {
    if (reservingRef.current || reserveItem) return;
    if (listing.expiry <= 0) return; // expiry guard
    if (listing.reserved) return;    // already reserved guard
    reservingRef.current = true;
    setReserveItem(listing);
  }, [reserveItem]);

  const closeReserveModal = useCallback(() => {
    setReserveItem(null);
    reservingRef.current = false;
  }, []);

  // FIX: all stats inside one useMemo — deps are accurate, no stale plain-variable reads
  const stats = useMemo(() => {
    const totalReserved = reservations.length;
    const mealsRescued  = reservations.reduce((acc, r) => acc + parseQty(r.listing.qty), 0);
    return [
      { label: "Your Reservations", value: totalReserved.toString(),                                       icon: "📋", color: COLORS.saffron,   trend: "This session" },
      { label: "Nearby Now",        value: `${listings.filter(l => l.expiry > 0 && !l.reserved).length}`,  icon: "📍", color: COLORS.alertRed,  trend: "Live" },
      { label: "Meals Reserved",    value: mealsRescued > 0 ? `${mealsRescued}+` : "0",                    icon: "🍽", color: COLORS.indiaGreen, trend: "By you" },
      { label: "Active Volunteers", value: "23",                                                            icon: "🤝", color: COLORS.amberGold,  trend: "Online" },
    ];
  }, [listings, reservations]);

  const totalReserved = reservations.length;
  const mealsRescued  = reservations.reduce((acc, r) => acc + parseQty(r.listing.qty), 0);

  const navItems = [
    { id: "dashboard",    icon: "🏠", label: "Dashboard" },
    { id: "browse",       icon: "🗺", label: "Browse Food" },
    { id: "reservations", icon: "📋", label: "Reservations" },
    { id: "reports",      icon: "📊", label: "Impact" },
    { id: "settings",     icon: "⚙️", label: "Settings" },
  ];

  return (
    <div className="dash-layout" style={{ display: "flex", height: "100vh", background: dark ? "#111" : COLORS.warmIvory, fontFamily: "'Trebuchet MS', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div className="dash-sidebar" style={{ width: 220, background: dark ? "#1a1a1a" : "#fff", borderRight: `1px solid ${dark ? "#333" : COLORS.warmSand}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.saffron, fontFamily: "Georgia, serif" }}>🌾 BharatMap</div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.mintMist, border: `2px solid ${COLORS.indiaGreen}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤝</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>{ngoName.split(" ").slice(0,2).join(" ")}</div>
              <div style={{ fontSize: 10, color: COLORS.indiaGreen, fontWeight: 600 }}>✓ Verified NGO</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(item => (
            <div key={item.id} role="button" tabIndex={0} aria-current={activeTab === item.id ? "page" : undefined}
              onClick={() => setActiveTab(item.id)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setActiveTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer", background: activeTab === item.id ? COLORS.saffronGlow : "transparent", color: activeTab === item.id ? COLORS.saffron : (dark ? "#9CA3AF" : COLORS.slate), fontWeight: activeTab === item.id ? 700 : 500, borderLeft: activeTab === item.id ? `3px solid ${COLORS.saffron}` : "3px solid transparent", transition: "all 0.2s", fontSize: 13 }}>
              <span>{item.icon}</span> {item.label}
              {item.id === "reservations" && reservations.length > 0 && (
                <span style={{ marginLeft: "auto", background: COLORS.saffron, color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{reservations.length}</span>
              )}
            </div>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: `1px solid ${dark ? "#333" : COLORS.warmSand}`, display: "flex", gap: 8 }}>
          <button onClick={onLogout} title="Back to Home" style={{ flex: 1, padding: "8px", background: COLORS.blushRed, color: COLORS.alertRed, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Sign Out</button>
          <DarkModeToggle dark={dark} onToggle={onToggleDark} />
        </div>
      </div>

      {/* Main content */}
      <div className="dash-main-content" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar with back button */}
        <div style={{ background: dark ? "#1a1a1a" : "#fff", padding: "0 24px", height: 56, display: "flex", alignItems: "center", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}`, gap: 12 }}>
          <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: dark ? "#9CA3AF" : COLORS.slate, display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6 }} title="Back to BharatMap home">← Home</button>
          <div style={{ width: 1, height: 20, background: dark ? "#333" : COLORS.warmSand }} />
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, fontFamily: "Georgia, serif" }}>
            {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
          </div>
          {urgentCount > 0 && (
            <div role="status" aria-live="polite" style={{ padding: "6px 14px", background: COLORS.blushRed, borderRadius: 999, fontSize: 11, fontWeight: 700, color: COLORS.alertRed, animation: "urgentPulse 2s infinite" }}>
              ⚡ {urgentCount} expiring soon
            </div>
          )}
          <div style={{ fontSize: 11, color: COLORS.ash }}>Ranchi, JH</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: dark ? "#111" : COLORS.warmIvory }}>
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div>
              <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", marginBottom: 20, background: `linear-gradient(135deg, #1A1A1A 0%, #2d1500 50%, ${COLORS.deepSaffron} 100%)`, padding: "28px 28px 0 28px", minHeight: 260 }}>
                <GravityBlob color={COLORS.saffron} size="200px" top="-20px" left="-20px" />
                <GravityBlob color={COLORS.indiaGreen} size="150px" top="40%" left="60%" delay="3s" />
                <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, marginBottom: 4 }}>{getGreeting()}</div>
                    <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "Georgia, serif", lineHeight: 1.2 }}>{ngoName}</div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 6 }}>Ranchi · {listings.filter(l => l.expiry > 0 && !l.reserved).length} listings available</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button onClick={() => setActiveTab("browse")} style={{ padding: "10px 20px", background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Browse Food →</button>
                      <button onClick={() => setActiveTab("reservations")} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📋 My Reservations {reservations.length > 0 && `(${reservations.length})`}</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {stats.map((s, idx) => (
                      <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", borderRadius: 14, padding: "14px 16px", minWidth: 120, border: "1px solid rgba(255,255,255,0.15)", animation: `floatCard 4s ease-in-out ${idx * 0.5}s infinite` }}>
                        <div style={{ fontSize: 20 }}>{s.icon}</div>
                        <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 4 }}>{s.value}</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 }}>{s.label}</div>
                        <div style={{ color: s.color, fontSize: 10, fontWeight: 700, marginTop: 4 }}>↑ {s.trend}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {urgentCount > 0 && (
                  <div style={{ position: "relative", zIndex: 2, marginTop: 20, marginLeft: -28, marginRight: -28, padding: "12px 28px", background: "rgba(217,48,37,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "urgentPulse 1.5s infinite" }} />
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>⚡ {urgentCount} listing{urgentCount > 1 ? "s" : ""} expire in under 60 min</span>
                    <button onClick={() => setActiveTab("browse")} style={{ marginLeft: "auto", padding: "5px 14px", background: "#fff", color: COLORS.alertRed, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>View Now →</button>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.charcoal, marginBottom: 12, fontFamily: "Georgia, serif" }}>🔥 Nearby — Act Fast</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...listings.filter(l => l.expiry > 0 && !l.reserved)].sort((a,b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || a.expiry - b.expiry).slice(0, 4).map(l => (
                      <div key={l.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: l.urgent ? `1.5px solid ${COLORS.alertRed}30` : `1px solid ${COLORS.warmSand}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}>
                        {/* FIX: SmallThumb uses React state — no DOM mutation */}
                        <SmallThumb listing={l} size={48} borderRadius={10} fontSize={32} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: COLORS.slate }}>{l.donor} · {l.dist}</div>
                        </div>
                        <CountdownBadge expiry={l.expiry} />
                        <button disabled={!!reserveItem} onClick={() => handleReserveItem(l)}
                          style={{ padding: "7px 14px", background: l.urgent ? COLORS.alertRed : COLORS.saffron, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: reserveItem ? "not-allowed" : "pointer", opacity: reserveItem ? 0.6 : 1 }}>
                          Reserve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: `1px solid ${COLORS.warmSand}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal, marginBottom: 12 }}>📋 Active Reservations</div>
                    {reservations.length === 0 ? (
                      <div style={{ fontSize: 12, color: COLORS.ash, textAlign: "center", padding: "16px 0" }}>No reservations yet</div>
                    ) : reservations.slice(0, 3).map((r, i) => (
                      <div key={`${r.code}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${COLORS.warmSand}` }}>
                        <div style={{ fontSize: 20 }}>{r.listing.img}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.charcoal }}>{r.listing.name}</div>
                          <div style={{ fontSize: 11, color: COLORS.ash }}>Code: {r.code}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.indiaGreen, padding: "2px 8px", background: COLORS.mintMist, borderRadius: 999 }}>Confirmed</span>
                      </div>
                    ))}
                    {reservations.length > 3 && (
                      <button onClick={() => setActiveTab("reservations")} style={{ marginTop: 8, width: "100%", padding: "6px", background: "none", border: `1px solid ${COLORS.warmSand}`, borderRadius: 8, fontSize: 11, color: COLORS.slate, cursor: "pointer" }}>View all {reservations.length} →</button>
                    )}
                  </div>
                  {/* Monthly goal */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: `1px solid ${COLORS.warmSand}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal, marginBottom: 10 }}>🏆 Session Goal</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto" }}>
                        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 100, height: 100 }}>
                          <circle cx="50" cy="50" r="42" fill="none" stroke={COLORS.warmSand} strokeWidth="10" />
                          <circle cx="50" cy="50" r="42" fill="none" stroke={COLORS.saffron} strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 42 * Math.min(totalReserved / 5, 1)} ${2 * Math.PI * 42}`}
                            strokeLinecap="round" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.saffron }}>{Math.round(Math.min(totalReserved / 5, 1) * 100)}%</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.slate, marginTop: 6 }}>{totalReserved} / 5 reservations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BROWSE TAB */}
          {activeTab === "browse" && (
            <BrowsePage listings={listings} onReserve={handleReserveItem} reserveItem={reserveItem} onConfirmed={handleReserved} embedded userRole="ngo" />
          )}

          {/* RESERVATIONS TAB */}
          {activeTab === "reservations" && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 16, fontFamily: "Georgia, serif" }}>📋 My Reservations</div>
              {reservations.length === 0 ? (
                <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "40px 24px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>No reservations yet</div>
                  <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 6 }}>Browse food listings and reserve to see them here</div>
                  <button onClick={() => setActiveTab("browse")} style={{ marginTop: 16, padding: "10px 20px", background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Browse Food →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {reservations.map((r, i) => {
                    // Find donor location from DEMO_USERS if available
                    const donorEntry = Object.values(DEMO_USERS).find(u => u.name === r.listing.donor);
                    const loc = donorEntry?.location;
                    return (
                      <div key={`${r.code}-${i}`} style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                          <SmallThumb listing={r.listing} size={56} borderRadius={12} fontSize={30} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>{r.listing.name}</div>
                            <div style={{ fontSize: 12, color: COLORS.slate }}>{r.listing.donor} · {r.listing.dist}</div>
                            <div style={{ fontSize: 11, color: COLORS.ash, marginTop: 2 }}>Reserved at {r.time}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 10, color: COLORS.saffron, fontWeight: 700, letterSpacing: 1 }}>PICKUP CODE</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.saffron, letterSpacing: 3, fontFamily: "monospace" }}>{r.code}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.indiaGreen, padding: "4px 10px", background: COLORS.mintMist, borderRadius: 999, flexShrink: 0 }}>✓ Confirmed</span>
                        </div>
                        {/* DONOR LOCATION PANEL */}
                        <div style={{ borderTop: `1px solid ${dark ? "#333" : COLORS.warmSand}`, background: dark ? "#141414" : COLORS.warmIvory, padding: "14px 20px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.saffron, letterSpacing: 1, marginBottom: 8 }}>📍 PICKUP LOCATION — {r.listing.donor.toUpperCase()}</div>
                          {loc ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <div>
                                <div style={{ fontSize: 11, color: COLORS.ash, fontWeight: 600 }}>ADDRESS</div>
                                <div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{loc.address}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: COLORS.ash, fontWeight: 600 }}>LANDMARK</div>
                                <div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{loc.landmark}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: COLORS.ash, fontWeight: 600 }}>PHONE</div>
                                <div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{loc.phone}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: COLORS.ash, fontWeight: 600 }}>HOURS</div>
                                <div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{loc.hours}</div>
                              </div>
                              <div style={{ gridColumn: "1 / -1" }}>
                                <div style={{ fontSize: 11, color: COLORS.ash, fontWeight: 600 }}>GPS COORDINATES</div>
                                <div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2, fontFamily: "monospace" }}>{loc.lat}, {loc.lng}</div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: COLORS.slate }}>
                              <span style={{ fontWeight: 700 }}>📌 {r.listing.donor}</span> · {r.listing.dist} from you · Contact them with your pickup code: <span style={{ fontFamily: "monospace", fontWeight: 700, color: COLORS.saffron }}>{r.code}</span>
                            </div>
                          )}
                          <a href={`https://maps.google.com/?q=${loc ? loc.address : r.listing.donor + " Ranchi"}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "6px 14px", background: COLORS.indiaGreen, color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                            🗺 Open in Maps →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* IMPACT TAB */}
          {activeTab === "reports" && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 16, fontFamily: "Georgia, serif" }}>📊 Impact Report</div>
              <div className="res-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                {[
                  ["🍽", `${(1284 + mealsRescued).toLocaleString()}`, "Meals Rescued",       COLORS.saffron],
                  ["♻️", `${(642 + Math.round(mealsRescued * 0.4))} kg`, "Food Saved",        COLORS.indiaGreen],
                  ["🤝", `${totalReserved}`,                          "Your Reservations",    COLORS.amberGold],
                ].map(([icon, val, label, color]) => (
                  <div key={label} style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, textAlign: "center" }}>
                    <div style={{ fontSize: 32 }}>{icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 8 }}>{val}</div>
                    <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 12 }}>🌱 Environmental Impact</div>
                <div style={{ fontSize: 13, color: dark ? "#9CA3AF" : COLORS.slate, lineHeight: 1.7 }}>
                  By rescuing <strong style={{ color: dark ? "#f5f5f5" : COLORS.charcoal }}>{642 + Math.round(mealsRescued * 0.4)} kg</strong> of food, Jharkhand Seva has prevented approximately <strong style={{ color: dark ? "#f5f5f5" : COLORS.charcoal }}>{Math.round((642 + mealsRescued * 0.4) * 3)} kg of CO₂</strong> from entering the atmosphere — equivalent to planting <strong style={{ color: dark ? "#f5f5f5" : COLORS.charcoal }}>{Math.round((642 + mealsRescued * 0.4) / 7.4)} trees</strong>.
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 16, fontFamily: "Georgia, serif" }}>⚙️ Settings</div>
              <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 12 }}>Organisation Profile</div>
                {[["Name", ngoName], ["City", "Ranchi, Jharkhand"], ["Reg. No.", "NGO/2023/JH/0042"], ["Status", "✓ Verified"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 16, padding: "8px 0", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                    <div style={{ width: 100, fontSize: 12, color: COLORS.ash, fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 13, color: dark ? "#d1d5db" : COLORS.charcoal }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 12 }}>Notification Preferences</div>
                {[
                  { key: "urgent",      label: "Urgent listings nearby" },
                  { key: "newListings", label: "New listings in Ranchi" },
                  { key: "reminders",   label: "Reservation reminders" },
                ].map(pref => (
                  <div key={pref.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                    <div style={{ fontSize: 13, color: dark ? "#d1d5db" : COLORS.charcoal }}>{pref.label}</div>
                    <div role="switch" aria-checked={notifPrefs[pref.key]} tabIndex={0}
                      onClick={() => setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                      onKeyDown={e => (e.key === " " || e.key === "Enter") && setNotifPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                      style={{ width: 44, height: 24, borderRadius: 999, background: notifPrefs[pref.key] ? COLORS.indiaGreen : COLORS.warmSand, display: "flex", alignItems: "center", padding: "2px 3px", cursor: "pointer", transition: "background 0.25s" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", marginLeft: notifPrefs[pref.key] ? "auto" : 0, transition: "margin 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {reserveItem && (
        <ReserveModal listing={reserveItem} onClose={closeReserveModal} onConfirmed={handleReserved} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// RESTAURANT DASHBOARD — FIX: all issues
// ─────────────────────────────────────────────
function RestaurantDashboard({ listings, setListings, onAddListing, onLogout, donorName = "Hotel Chanakya", dark, onToggleDark, sharedReservations = [] }) {
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [showForm,   setShowForm]   = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [formData,   setFormData]   = useState({ name: "", qty: "", type: "Cooked Meal", dist: "0.5 km", expiry: 120, photoUrl: "" });
  const [formError,  setFormError]  = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  // Location state — initialized from DEMO_USERS if available
  const initLoc = Object.values(DEMO_USERS).find(u => u.name === donorName)?.location;
  const [locationData, setLocationData] = useState(initLoc || { address: "", landmark: "", phone: "", hours: "", lat: "", lng: "" });
  const [locationSaved, setLocationSaved] = useState(false);
  const allReservations = sharedReservations;

  const typeOptions = ["Cooked Meal", "Bakery", "Produce", "Sweets", "Snacks"];
  const typeEmojis  = { "Cooked Meal": "🍛", Bakery: "🍞", Produce: "🍎", Sweets: "🍮", Snacks: "🥨" };

  const handleSubmit = useCallback(() => {
    const trimmedName = formData.name.trim();
    const trimmedQty  = formData.qty.trim();
    if (!trimmedName) { setFormError("Food name is required."); return; }
    if (trimmedName.length < 3) { setFormError("Food name must be at least 3 characters."); return; }
    if (trimmedName.length > 80) { setFormError("Food name too long (max 80 characters)."); return; }
    if (!trimmedQty)  { setFormError("Quantity is required."); return; }
    const qty    = parseFloat(trimmedQty);
    const expiry = Math.round(parseFloat(String(formData.expiry)));
    if (isNaN(qty) || qty <= 0) { setFormError("Quantity must be a positive number."); return; }
    if (qty > 10000) { setFormError("Quantity seems unrealistically high (max 10,000)."); return; }
    if (isNaN(expiry) || expiry < 5) { setFormError("Expiry must be at least 5 minutes."); return; }
    if (expiry > 1440) { setFormError("Expiry cannot exceed 24 hours."); return; }
    // Validate distance format
    if (!/^\d+(\.\d+)?\s*km$/i.test(formData.dist.trim()) && formData.dist.trim() !== "") {
      setFormError("Distance format should be like '1.2 km'"); return;
    }
    // Validate photo URL if provided
    const photoTrimmed = formData.photoUrl.trim();
    if (photoTrimmed && !/^https?:\/\//i.test(photoTrimmed)) {
      setFormError("Photo URL must start with https://"); return;
    }
    setFormError("");
    onAddListing({
      id: Date.now(), name: trimmedName, donor: donorName, type: formData.type,
      qty: `${qty} ${formData.type === "Produce" ? "kg" : "portions"}`,
      urgent: expiry < 90, dist: formData.dist || "1.0 km",
      img: typeEmojis[formData.type] || "🍽",
      photoUrl: formData.photoUrl.trim() || FOOD_PHOTOS[formData.type] || "",
      rating: 4.8, expiry, reserved: false,
    });
    setFormData({ name: "", qty: "", type: "Cooked Meal", dist: "0.5 km", expiry: 120, photoUrl: "" });
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }, [formData, donorName, onAddListing]);

  const myListings = useMemo(() => listings.filter(l => l.donor === donorName), [listings, donorName]);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  // Delete listing — FIX: no window.confirm (blocked in sandbox), use inline state
  const handleDelete = useCallback((id, name) => {
    setDeleteConfirm({ id, name });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    setListings(prev => prev.filter(l => l.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  }, [deleteConfirm, setListings]);

  const navItems = [
    ["🏠", "dashboard"],
    ["📋", "mylistings"],
    ["📍", "location"],
    ["📊", "impact"],
    ["⚙️", "settings"],
  ];
  const navLabels = { dashboard: "Dashboard", mylistings: "My Listings", location: "Location", impact: "Impact", settings: "Settings" };

  return (
    <div className="dash-layout" style={{ display: "flex", height: "100vh", background: dark ? "#111" : COLORS.warmIvory, fontFamily: "'Trebuchet MS', sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div className="dash-sidebar" style={{ width: 220, background: dark ? "#1a1a1a" : "#fff", borderRight: `1px solid ${dark ? "#333" : COLORS.warmSand}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.saffron, fontFamily: "Georgia, serif" }}>🌾 BharatMap</div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.saffronGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>{donorName}</div>
              <div style={{ fontSize: 10, color: COLORS.saffron, fontWeight: 600 }}>✓ Verified Donor</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(([icon, id]) => (
            <div key={id} role="button" tabIndex={0} aria-current={activeTab === id ? "page" : undefined}
              onClick={() => setActiveTab(id)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setActiveTab(id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer", fontSize: 13, background: activeTab === id ? COLORS.saffronGlow : "transparent", color: activeTab === id ? COLORS.saffron : (dark ? "#9CA3AF" : COLORS.slate), fontWeight: activeTab === id ? 700 : 500, borderLeft: activeTab === id ? `3px solid ${COLORS.saffron}` : "3px solid transparent", transition: "all 0.2s" }}>
              {icon} {navLabels[id]}
            </div>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: `1px solid ${dark ? "#333" : COLORS.warmSand}`, display: "flex", gap: 8 }}>
          <button onClick={onLogout} style={{ flex: 1, padding: "8px", background: COLORS.blushRed, color: COLORS.alertRed, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Sign Out</button>
          <DarkModeToggle dark={dark} onToggle={onToggleDark} />
        </div>
      </div>

      {/* Main */}
      <div className="dash-main-content" style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: dark ? "#111" : COLORS.warmIvory }}>
        {submitted && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 500, background: COLORS.indiaGreen, color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "slideDown 0.3s ease" }}>
            ✓ Listing published successfully!
          </div>
        )}

        {/* FIX: Inline delete confirmation (replaces window.confirm which is sandbox-blocked) */}
        {deleteConfirm && (
          <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 600, background: "#fff", border: `1.5px solid ${COLORS.alertRed}`, borderRadius: 14, padding: "16px 24px", boxShadow: "0 12px 40px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 16, animation: "slideDown 0.25s ease", minWidth: 320 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal }}>Delete "{deleteConfirm.name}"?</div>
              <div style={{ fontSize: 11, color: COLORS.slate, marginTop: 3 }}>This cannot be undone.</div>
            </div>
            <button onClick={() => setDeleteConfirm(null)} style={{ padding: "6px 14px", background: COLORS.warmIvory, border: `1px solid ${COLORS.warmSand}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: COLORS.slate }}>Cancel</button>
            <button onClick={confirmDelete} style={{ padding: "6px 14px", background: COLORS.alertRed, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#fff" }}>🗑 Delete</button>
          </div>
        )}

        {/* Top bar with back button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, cursor: "pointer", fontSize: 13, color: dark ? "#9CA3AF" : COLORS.slate, padding: "6px 12px", borderRadius: 8, fontWeight: 600 }}>← Back to Home</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowVerify(true)} style={{ padding: "8px 16px", background: COLORS.mintMist, color: COLORS.indiaGreen, border: `1px solid ${COLORS.indiaGreen}30`, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🔍 Verify Pickup Code</button>
          <button onClick={() => setShowForm(true)} style={{ padding: "8px 16px", background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>➕ Add Listing</button>
        </div>

        {/* Hero banner */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", marginBottom: 20, background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, padding: "28px 32px" }}>
          <GravityBlob color="#fff" size="200px" top="-30px" left="60%" delay="0s" />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: 1.5 }}>RESTAURANT PORTAL</div>
            <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, fontFamily: "Georgia, serif", marginTop: 4 }}>{donorName}, Ranchi</div>
          </div>
        </div>

        {/* Stats */}
        <div className="res-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {(() => {
            const reservedListings = myListings.filter(l => l.reserved);
            const kgRescued = (18 + reservedListings.reduce((acc, l) => acc + parseQty(l.qty) * 0.4, 0)).toFixed(1);
            return [
              ["🍽", `${myListings.length + 42}`,                             "Meals donated"],
              ["♻️", `${kgRescued} kg`,                                        "Food rescued"],
              ["⭐", "4.8",                                                    "Donor rating"],
              ["📋", `${myListings.filter(l => l.expiry > 0).length}`,         "Active listings"],
            ];
          })().map(([icon, val, label]) => (
            <div key={label} style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "16px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
              <div style={{ fontSize: 24 }}>{icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: dark ? "#f5f5f5" : COLORS.charcoal, marginTop: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: COLORS.slate }}>{label}</div>
            </div>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "18px 20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 14 }}>Recent Listings</div>
            {myListings.length === 0 ? (
              <div style={{ fontSize: 13, color: COLORS.ash, textAlign: "center", padding: "24px 0" }}>No listings yet — add your first one above!</div>
            ) : (
              myListings.slice(0, 5).map(l => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                  {/* FIX: gradient bg ensures something always renders */}
                  <SmallThumb listing={l} size={44} borderRadius={10} fontSize={22} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.slate }}>{l.qty}</div>
                  </div>
                  <CountdownBadge expiry={l.expiry} />
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: l.expiry > 0 ? COLORS.mintMist : COLORS.warmSand, color: l.expiry > 0 ? COLORS.indiaGreen : COLORS.ash }}>{l.expiry > 0 ? "Active" : "Expired"}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* MY LISTINGS TAB */}
        {activeTab === "mylistings" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 16, fontFamily: "Georgia, serif" }}>📋 My Listings ({myListings.length})</div>
            {myListings.length === 0 ? (
              <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "40px 24px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>No listings yet</div>
                <button onClick={() => setShowForm(true)} style={{ marginTop: 14, padding: "10px 20px", background: COLORS.saffron, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>➕ Add First Listing</button>
              </div>
            ) : (
              <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "18px 20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                {myListings.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                  <SmallThumb listing={l} size={48} borderRadius={10} fontSize={26} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.slate }}>{l.qty} · {l.dist}</div>
                    </div>
                    <CountdownBadge expiry={l.expiry} />
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: l.expiry > 0 ? COLORS.mintMist : COLORS.warmSand, color: l.expiry > 0 ? COLORS.indiaGreen : COLORS.ash }}>{l.expiry > 0 ? "Active" : "Expired"}</span>
                    <button onClick={() => handleDelete(l.id, l.name)} aria-label={`Delete ${l.name}`}
                      style={{ padding: "5px 10px", background: COLORS.blushRed, color: COLORS.alertRed, border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      🗑 Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOCATION TAB — Add/Edit restaurant pickup location */}
        {activeTab === "location" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 6, fontFamily: "Georgia, serif" }}>📍 Pickup Location</div>
            <div style={{ fontSize: 13, color: COLORS.slate, marginBottom: 20 }}>This address will be shown to NGOs when they confirm a reservation from your restaurant.</div>
            {locationSaved && (
              <div style={{ marginBottom: 16, padding: "10px 16px", background: COLORS.mintMist, borderRadius: 10, border: `1px solid ${COLORS.indiaGreen}30`, fontSize: 13, fontWeight: 700, color: COLORS.indiaGreen }}>
                ✅ Location saved! NGOs will now see this when they confirm orders from you.
              </div>
            )}
            <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "24px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
              {[
                { key: "address",  label: "Full Address",           placeholder: "e.g. 12-B, Main Road, Lalpur, Ranchi - 834001" },
                { key: "landmark", label: "Landmark / Directions",  placeholder: "e.g. Near Lalpur Chowk, opposite State Bank ATM" },
                { key: "phone",    label: "Contact Phone",          placeholder: "e.g. +91 98765 43210" },
                { key: "hours",    label: "Operating Hours",        placeholder: "e.g. Mon–Sat: 10am–10pm" },
                { key: "lat",      label: "Latitude (optional)",    placeholder: "e.g. 23.3441° N" },
                { key: "lng",      label: "Longitude (optional)",   placeholder: "e.g. 85.3096° E" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 5, letterSpacing: 0.5 }}>{f.label.toUpperCase()}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={locationData[f.key]}
                    onChange={e => { setLocationData(p => ({ ...p, [f.key]: e.target.value })); setLocationSaved(false); }}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${dark ? "#333" : COLORS.warmSand}`, fontSize: 13, outline: "none", boxSizing: "border-box", background: dark ? "#242424" : "#fff", color: dark ? "#f5f5f5" : COLORS.charcoal, transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = COLORS.saffron}
                    onBlur={e => e.target.style.borderColor = dark ? "#333" : COLORS.warmSand}
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  // Persist location back into DEMO_USERS so NGO can read it
                  const entry = Object.values(DEMO_USERS).find(u => u.name === donorName);
                  if (entry) entry.location = { ...locationData };
                  setLocationSaved(true);
                }}
                style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                💾 Save Location
              </button>
            </div>

            {/* Preview card */}
            {locationData.address && (
              <div style={{ marginTop: 16, background: dark ? "#1a1a1a" : COLORS.warmIvory, borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.saffron, letterSpacing: 1, marginBottom: 12 }}>👁 PREVIEW — What NGOs will see</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {locationData.address  && <div><div style={{ fontSize: 10, color: COLORS.ash, fontWeight: 600 }}>ADDRESS</div><div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{locationData.address}</div></div>}
                  {locationData.landmark && <div><div style={{ fontSize: 10, color: COLORS.ash, fontWeight: 600 }}>LANDMARK</div><div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{locationData.landmark}</div></div>}
                  {locationData.phone    && <div><div style={{ fontSize: 10, color: COLORS.ash, fontWeight: 600 }}>PHONE</div><div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{locationData.phone}</div></div>}
                  {locationData.hours    && <div><div style={{ fontSize: 10, color: COLORS.ash, fontWeight: 600 }}>HOURS</div><div style={{ fontSize: 12, color: dark ? "#d1d5db" : COLORS.charcoal, marginTop: 2 }}>{locationData.hours}</div></div>}
                </div>
              </div>
            )}
          </div>
        )}
        {/* IMPACT TAB */}
        {activeTab === "impact" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 16, fontFamily: "Georgia, serif" }}>📊 Your Impact</div>
            <div className="res-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {(() => {
                const reservedKg = (18 + myListings.filter(l => l.reserved).reduce((a, l) => a + parseQty(l.qty) * 0.4, 0)).toFixed(1);
                return [
                  ["🍽", `${myListings.length + 42}`, "Total Meals Donated", COLORS.saffron],
                  ["♻️", `${reservedKg} kg`, "Food From Landfills", COLORS.indiaGreen],
                  ["⭐", "4.8", "Donor Rating", COLORS.amberGold],
                ];
              })().map(([icon, val, label, color]) => (
                <div key={label} style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}`, textAlign: "center" }}>
                  <div style={{ fontSize: 32 }}>{icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 8 }}>{val}</div>
                  <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 16, fontFamily: "Georgia, serif" }}>⚙️ Settings</div>
            <div style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f5f5f5" : COLORS.charcoal, marginBottom: 12 }}>Restaurant Profile</div>
              {[["Name", donorName], ["City", "Ranchi, Jharkhand"], ["FSSAI", "10020042002347"], ["Status", "✓ Verified Donor"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 16, padding: "8px 0", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                  <div style={{ width: 100, fontSize: 12, color: COLORS.ash, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 13, color: dark ? "#d1d5db" : COLORS.charcoal }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add listing modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-inner" style={{ width: 480, background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.25)", animation: "bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, fontFamily: "Georgia, serif" }}>➕ Add New Listing</div>
              <button onClick={() => setShowForm(false)} aria-label="Close form" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "24px 28px 28px" }}>
              {[
                { label: "Food Name",            key: "name",     type: "text",   placeholder: "e.g. Paneer Tikka",    maxLen: 80 },
                { label: "Quantity (number)",    key: "qty",      type: "number", placeholder: "e.g. 30 (portions or kg)", min: "1" },
                { label: "Distance from NGO",    key: "dist",     type: "text",   placeholder: "e.g. 1.2 km" },
                { label: "Expires in (minutes)", key: "expiry",   type: "number", placeholder: "e.g. 120",             min: "5", max: "1440" },
                { label: "Photo URL (optional)", key: "photoUrl", type: "url",    placeholder: "https://..." },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 5, letterSpacing: 0.5 }}>{f.label.toUpperCase()}</label>
                  <input type={f.type} min={f.min} max={f.max} maxLength={f.maxLen} placeholder={f.placeholder}
                    value={formData[f.key]}
                    onChange={e => { setFormError(""); setFormData(p => ({ ...p, [f.key]: e.target.value })); }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = COLORS.saffron}
                    onBlur={e => e.target.style.borderColor = COLORS.warmSand} />
                </div>
              ))}
              {/* Photo preview — React state handles load error cleanly */}
              {formData.photoUrl && (
                <div style={{ marginBottom: 14, borderRadius: 10, overflow: "hidden", height: 140, background: FOOD_GRADIENTS[formData.type] || FOOD_GRADIENTS["default"] }}>
                  <ImgWithFallback src={formData.photoUrl} alt="Preview" fallbackEmoji={formData.type ? ({"Cooked Meal":"🍛","Bakery":"🍞","Produce":"🍎","Sweets":"🍮","Snacks":"🥨"}[formData.type] || "🍽") : "🍽"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.slate, marginBottom: 5, letterSpacing: 0.5 }}>FOOD TYPE</label>
                <select value={formData.type} onChange={e => { setFormData(p => ({ ...p, type: e.target.value, photoUrl: p.photoUrl && !Object.values(FOOD_PHOTOS).includes(p.photoUrl) ? p.photoUrl : (FOOD_PHOTOS[e.target.value] || "") })); }}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${COLORS.warmSand}`, fontSize: 13, outline: "none", background: "#fff" }}>
                  {typeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {formError && (
                <div role="alert" style={{ fontSize: 12, color: COLORS.alertRed, marginBottom: 12, padding: "8px 12px", background: COLORS.blushRed, borderRadius: 8 }}>{formError}</div>
              )}
              <button onClick={handleSubmit} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Publish Listing →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIX: Code verification modal */}
      {showVerify && <VerifyCodeModal reservations={allReservations} onClose={() => setShowVerify(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard({ listings, onLogout, dark, onToggleDark, adminName = "Platform Admin" }) {
  const [adminTab, setAdminTab] = useState("Overview");
  const adminNavItems = [["🏠", "Overview"], ["👥", "Users"], ["🍽", "Listings"], ["🚨", "Complaints"], ["⚙️", "System"]];

  return (
    <div className="dash-layout" style={{ display: "flex", height: "100vh", background: "#0f0f1a", fontFamily: "'Trebuchet MS', sans-serif", overflow: "hidden" }}>
      <div className="dash-sidebar" style={{ width: 220, background: "#16162a", borderRight: "1px solid #2a2a40", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #2a2a40" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#7C3AED", fontFamily: "Georgia, serif" }}>🛡️ BharatMap Admin</div>
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: "#a0a0c0" }}>{adminName}</div>
          <div style={{ marginTop: 2, fontSize: 11, color: "#6B7280" }}>Platform Control Center</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {adminNavItems.map(([icon, label]) => (
            <div key={label} role="button" tabIndex={0} aria-current={adminTab === label ? "page" : undefined}
              onClick={() => setAdminTab(label)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setAdminTab(label)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer", fontSize: 13, background: adminTab === label ? "#1e1e38" : "transparent", color: adminTab === label ? "#7C3AED" : "#6B7280", borderLeft: adminTab === label ? "3px solid #7C3AED" : "3px solid transparent", transition: "all 0.2s" }}>
              {icon} {label}
            </div>
          ))}
        </nav>
        <div style={{ padding: 16, borderTop: "1px solid #2a2a40", display: "flex", gap: 8 }}>
          <button onClick={onLogout} style={{ flex: 1, padding: "8px", background: "#2a1030", color: "#7C3AED", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>← Sign Out</button>
          <DarkModeToggle dark={dark} onToggle={onToggleDark} />
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
        {/* Back button */}
        <button onClick={onLogout} style={{ marginBottom: 16, background: "#1e1e38", border: "1px solid #2a2a40", cursor: "pointer", fontSize: 13, color: "#9CA3AF", padding: "6px 14px", borderRadius: 8, fontWeight: 600 }} title="Back to BharatMap">← Back to Home</button>
        <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 20, background: "linear-gradient(135deg, #1a0a2e, #16213e, #0f3460)", padding: "28px 32px" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>ADMIN CONTROL CENTER</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, fontFamily: "Georgia, serif", marginTop: 4 }}>Platform Overview</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>Welcome, {adminName} · Ranchi, Jharkhand</div>
        </div>
        <div className="res-grid4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {[
            ["👥", "247", "Total Users", "#7C3AED"],
            ["🍽", `${listings.filter(l => l.expiry > 0).length}`, "Active Listings", "#FF6B00"],
            ["✅", "3", "Pending Verifications", "#F59E0B"],
            ["🚨", "3", "Open Complaints", "#D93025"],
          ].map(([icon, val, label, color]) => (
            <div key={label} style={{ background: "#16162a", borderRadius: 16, padding: "16px", border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 24 }}>{icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{label}</div>
            </div>
          ))}
        </div>
        {adminTab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#16162a", borderRadius: 16, padding: "18px 20px", border: "1px solid #2a2a40" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Pending Verifications</div>
              {[["Jharkhand Seva NGO", "NGO", "Pending"], ["Rang De Kitchen", "Restaurant", "Review"], ["Seva Trust", "NGO", "Docs needed"]].map(([name, type, status]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #2a2a40" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2a2a40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{name}</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>{type} · {status}</div>
                  </div>
                  <button style={{ padding: "4px 10px", background: "#7C3AED20", color: "#7C3AED", border: "1px solid #7C3AED40", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Review</button>
                </div>
              ))}
            </div>
            <div style={{ background: "#16162a", borderRadius: 16, padding: "18px 20px", border: "1px solid #2a2a40" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Recent Activity</div>
              {["New NGO registered: Khushi Foundation", "Listing flagged: Stale food report", "Volunteer completed delivery #2847", "Restaurant suspended: No-show × 3"].map((a) => (
                <div key={a} style={{ fontSize: 12, color: "#6B7280", padding: "8px 0", borderBottom: "1px solid #2a2a40", display: "flex", gap: 8 }}>
                  <span style={{ color: "#7C3AED" }}>›</span> {a}
                </div>
              ))}
            </div>
          </div>
        )}
        {adminTab === "Listings" && (
          <div style={{ background: "#16162a", borderRadius: 16, padding: "18px 20px", border: "1px solid #2a2a40" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>All Listings ({listings.length})</div>
            {listings.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #2a2a40" }}>
                <SmallThumb listing={l} size={40} borderRadius={8} fontSize={24} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{l.donor} · {l.qty}</div>
                </div>
                <CountdownBadge expiry={l.expiry} />
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: l.expiry > 0 ? "#1A7F4B20" : "#9CA3AF20", color: l.expiry > 0 ? "#1A7F4B" : "#9CA3AF" }}>{l.expiry > 0 ? "Active" : "Expired"}</span>
              </div>
            ))}
          </div>
        )}
        {["Users", "Complaints", "System"].map(tab => adminTab === tab && (
          <div key={tab} style={{ background: "#16162a", borderRadius: 16, padding: "18px 20px", border: "1px solid #2a2a40" }}>
            {tab === "Users" && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>User Directory</div>
                {[
                  ["🤝", "Jharkhand Seva NGO", "NGO", "Active", "#1A7F4B"],
                  ["🍽", "Hotel Chanakya", "Restaurant", "Active", "#FF6B00"],
                  ["🏠", "Rang De Kitchen", "Restaurant", "Pending", "#F59E0B"],
                  ["🤝", "Seva Trust", "NGO", "Docs needed", "#D93025"],
                  ["🏠", "Green Dhaba", "Restaurant", "Active", "#1A7F4B"],
                ].map(([icon, name, type, status, color]) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #2a2a40" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2a2a40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{type}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${color}20`, color }}>{status}</span>
                    <button style={{ padding: "4px 10px", background: "#7C3AED20", color: "#7C3AED", border: "1px solid #7C3AED40", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Manage</button>
                  </div>
                ))}
              </>
            )}
            {tab === "Complaints" && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Open Complaints (3)</div>
                {[
                  { id: "#C-001", user: "Anonymous NGO", issue: "Food quality below standard — stale rice reported", severity: "High", color: "#D93025" },
                  { id: "#C-002", user: "Khushi Foundation", issue: "Donor no-show at pickup — food wasted", severity: "Medium", color: "#F59E0B" },
                  { id: "#C-003", user: "Seva Trust", issue: "Incorrect quantity listed (40 portions received 12)", severity: "Medium", color: "#F59E0B" },
                ].map(c => (
                  <div key={c.id} style={{ padding: "14px 0", borderBottom: "1px solid #2a2a40" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", fontFamily: "monospace" }}>{c.id}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${c.color}20`, color: c.color }}>{c.severity}</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>Reported by {c.user}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#e5e5e5", marginBottom: 8 }}>{c.issue}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ padding: "4px 12px", background: "#1A7F4B20", color: "#1A7F4B", border: "1px solid #1A7F4B40", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Resolve</button>
                      <button style={{ padding: "4px 12px", background: "#D9302520", color: "#D93025", border: "1px solid #D9302540", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Escalate</button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {tab === "System" && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>System Health</div>
                {[
                  ["API Gateway", "Operational", "#1A7F4B", "99.98% uptime"],
                  ["Database", "Operational", "#1A7F4B", "Latency: 4ms"],
                  ["Image CDN", "Operational", "#1A7F4B", "Cache hit: 94%"],
                  ["Notification Service", "Degraded", "#F59E0B", "SMS delays ~30s"],
                  ["Expiry Timer Service", "Operational", "#1A7F4B", "60s tick healthy"],
                ].map(([svc, status, color, detail]) => (
                  <div key={svc} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #2a2a40" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, animation: status === "Degraded" ? "urgentPulse 2s infinite" : "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{svc}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{detail}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color }}>{status}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#0f0f1a", borderRadius: 10, border: "1px solid #2a2a40" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>PLATFORM VERSION</div>
                  <div style={{ fontSize: 13, color: "#fff", fontFamily: "monospace" }}>BharatMap v3.0.0 · Build {new Date().toISOString().slice(0, 10)}</div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE — FIX: auth guards, browse auth, back nav
// ─────────────────────────────────────────────
function LandingPage({ listings, setListings, onAddListing, dark, onToggleDark, sharedReservations, onSharedReservation }) {
  const [loginRole,  setLoginRole]  = useState(null);
  const [loggedIn,   setLoggedIn]   = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const [loggedUser, setLoggedUser] = useState(null);
  const handleLogin = useCallback((role, email) => {
    setLoginRole(null);
    setLoggedIn(role);
    setLoggedUser(DEMO_USERS[email] || null);
    setActivePage("home");
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedIn(null);
    setLoggedUser(null);
    setActivePage("home");
  }, []);

  const sharedProps = { dark, onToggleDark };

  // auth-gated dashboard renders
  const displayName = loggedUser?.name || "";
  if (loggedIn === "ngo")        return <NGODashboard        listings={listings} setListings={setListings} onLogout={handleLogout} sharedReservations={sharedReservations} onSharedReservation={onSharedReservation} ngoName={displayName} {...sharedProps} />;
  if (loggedIn === "restaurant") return <RestaurantDashboard listings={listings} setListings={setListings} onAddListing={onAddListing} onLogout={handleLogout} donorName={displayName || "Hotel Chanakya"} sharedReservations={sharedReservations} {...sharedProps} />;
  if (loggedIn === "admin")      return <AdminDashboard      listings={listings} onLogout={handleLogout} adminName={displayName} {...sharedProps} />;

  // ── BROWSE PAGE (public, read-only) ──
  if (activePage === "browse") return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: dark ? "#111" : COLORS.warmIvory, fontFamily: "'Trebuchet MS', sans-serif" }}>
      <nav style={{ background: dark ? "#1a1a1a" : "#fff", padding: "0 40px", height: 60, display: "flex", alignItems: "center", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}`, gap: 12, flexShrink: 0 }}>
        <button onClick={() => setActivePage("home")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 800, color: COLORS.saffron, fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 6 }}>← 🌾 BharatMap</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <DarkModeToggle dark={dark} onToggle={onToggleDark} />
          {[{ role: "admin", label: "Admin" }, { role: "restaurant", label: "Restaurant" }, { role: "ngo", label: "NGO Login" }].map(({ role, label }) => (
            <button key={role} onClick={() => setLoginRole(role)} style={{ padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${dark ? "#333" : COLORS.warmSand}`, background: dark ? "#222" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", color: dark ? "#e5e5e5" : COLORS.charcoal, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.saffronGlow; e.currentTarget.style.color = COLORS.saffron; e.currentTarget.style.borderColor = COLORS.saffron; }}
              onMouseLeave={e => { e.currentTarget.style.background = dark ? "#222" : "#fff"; e.currentTarget.style.color = dark ? "#e5e5e5" : COLORS.charcoal; e.currentTarget.style.borderColor = dark ? "#333" : COLORS.warmSand; }}>
              {label}
            </button>
          ))}
        </div>
      </nav>
      <div style={{ background: COLORS.saffronGlow, padding: "8px 40px", fontSize: 12, color: COLORS.saffron, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.saffron, display: "inline-block" }} />
        <span>🔒 Login as NGO to reserve food. Browsing as guest.</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: "20px 40px", background: dark ? "#111" : COLORS.warmIvory }}>
        <BrowsePage listings={listings} userRole={null} onReserve={() => setLoginRole("ngo")} />
      </div>
      {loginRole && <LoginModal role={loginRole} onClose={() => setLoginRole(null)} onLogin={handleLogin} />}
    </div>
  );

  // ── HOME / LANDING ──
  return (
    <div style={{ fontFamily: "'Trebuchet MS', Georgia, sans-serif", background: dark ? "#111" : COLORS.warmIvory, minHeight: "100vh", overflowX: "hidden", transition: "background 0.3s" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? (scrolled ? "rgba(17,17,17,0.95)" : "#1a1a1a") : (scrolled ? "rgba(253,248,242,0.92)" : "#fff"), backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}`, padding: "0 60px", height: 68, display: "flex", alignItems: "center", gap: 32, transition: "all 0.3s" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.saffron, fontFamily: "Georgia, serif" }}>🌾 BharatMap</div>
        <div style={{ display: "flex", gap: 28, marginLeft: 16 }}>
          {[
            { label: "How it works",    action: () => document.querySelector(".landing-howto")?.scrollIntoView({ behavior: "smooth" }) },
            { label: "Browse listings", action: () => setActivePage("browse") },
            { label: "For NGOs",        action: () => setLoginRole("ngo") },
            { label: "Impact",          action: () => document.querySelector(".landing-stats")?.scrollIntoView({ behavior: "smooth" }) },
          ].map(({ label, action }) => (
            <span key={label} onClick={action}
              style={{ fontSize: 14, color: dark ? "#9CA3AF" : COLORS.slate, cursor: "pointer", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = dark ? "#fff" : COLORS.charcoal}
              onMouseLeave={e => e.currentTarget.style.color = dark ? "#9CA3AF" : COLORS.slate}>{label}</span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <DarkModeToggle dark={dark} onToggle={onToggleDark} />
          {[{ role: "admin", label: "Admin" }, { role: "restaurant", label: "Restaurant" }, { role: "ngo", label: "NGO" }].map(({ role, label }) => (
            <button key={role} onClick={() => setLoginRole(role)}
              style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${dark ? "#333" : COLORS.warmSand}`, background: dark ? "#222" : "#fff", color: dark ? "#e5e5e5" : COLORS.charcoal, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.saffronGlow; e.currentTarget.style.color = COLORS.saffron; e.currentTarget.style.borderColor = COLORS.saffron; }}
              onMouseLeave={e => { e.currentTarget.style.background = dark ? "#222" : "#fff"; e.currentTarget.style.color = dark ? "#e5e5e5" : COLORS.charcoal; e.currentTarget.style.borderColor = dark ? "#333" : COLORS.warmSand; }}>
              {label}
            </button>
          ))}
          <button onClick={() => setLoginRole("restaurant")}
            style={{ padding: "9px 18px", borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${COLORS.saffron}40` }}>
            List food free →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" style={{ padding: "80px 80px 60px", maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, position: "relative", background: dark ? "#111" : "transparent" }}>
        <GravityBlob color={COLORS.saffron} size="400px" top="-60px" left="-80px" />
        <GravityBlob color={COLORS.indiaGreen} size="300px" top="30%" left="55%" delay="4s" />
        <div style={{ flex: "0 0 52%", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: dark ? "rgba(255,107,0,0.15)" : COLORS.saffronGlow, border: `1px solid ${COLORS.saffron}40`, borderRadius: 999, fontSize: 12, fontWeight: 700, color: COLORS.saffron, marginBottom: 20, animation: "slideDown 0.6s ease both" }}>
            🌟 Now active in Ranchi, Jharkhand
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: dark ? "#f5f5f5" : COLORS.charcoal, lineHeight: 1.12, margin: "0 0 20px", fontFamily: "Georgia, serif", animation: "slideDown 0.7s ease both 0.1s", opacity: 0, animationFillMode: "forwards" }}>
            Surplus food.<br />Real hunger.<br /><span style={{ color: COLORS.saffron, fontStyle: "italic" }}>Zero waste.</span>
          </h1>
          <p style={{ fontSize: 17, color: dark ? "#9CA3AF" : COLORS.slate, lineHeight: 1.75, maxWidth: 460, marginBottom: 28, animation: "slideDown 0.7s ease both 0.2s", opacity: 0, animationFillMode: "forwards" }}>
            BharatMap connects restaurants, caterers, and households with NGOs and shelters across Jharkhand — so surplus food reaches people instead of landfills.
          </p>
          <div style={{ display: "flex", gap: 12, animation: "slideDown 0.7s ease both 0.3s", opacity: 0, animationFillMode: "forwards" }}>
            <button onClick={() => setLoginRole("restaurant")}
              style={{ padding: "14px 24px", background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: `0 8px 28px ${COLORS.saffron}40`, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              Start listing food →
            </button>
            <button onClick={() => setActivePage("browse")}
              style={{ padding: "14px 24px", background: "#fff", color: COLORS.charcoal, border: `1.5px solid ${COLORS.warmSand}`, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.saffronGlow; e.currentTarget.style.borderColor = COLORS.saffron; e.currentTarget.style.color = COLORS.saffron; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = COLORS.warmSand; e.currentTarget.style.color = COLORS.charcoal; }}>
              Browse food nearby
            </button>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 24, padding: "14px 0", borderTop: `1px solid ${COLORS.warmSand}` }}>
            {[`✅ ${listings.filter(l => l.expiry > 0).length + 1278} meals rescued`, "🏢 48 verified donors", "🌍 Active in Ranchi +"].map(t => (
              <span key={t} style={{ fontSize: 12, color: dark ? "#9CA3AF" : COLORS.slate }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Hero card preview with real photo */}
        <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
          <div className="hero-card" style={{ background: dark ? "#1a1a1a" : "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.14)", transform: "rotate(2deg)" }}>
            <div style={{ background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, padding: "16px 20px", color: "#fff" }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>LIVE NEAR RANCHI</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{listings.filter(l => l.expiry > 0).length} listings available now</div>
            </div>
            {listings.slice(0, 3).map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
                <SmallThumb listing={l} size={40} borderRadius={8} fontSize={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal }}>{l.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.slate }}>{l.qty} · {l.dist}</div>
                </div>
                <CountdownBadge expiry={l.expiry} />
              </div>
            ))}
            <div style={{ padding: "12px 16px" }}>
              <button onClick={() => setActivePage("browse")}
                style={{ width: "100%", padding: "10px", background: `linear-gradient(135deg, ${COLORS.saffron}, ${COLORS.deepSaffron})`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                View all listings →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="landing-stats" style={{ background: dark ? "#1a1a1a" : "#fff", borderTop: `1px solid ${dark ? "#333" : COLORS.warmSand}`, borderBottom: `1px solid ${dark ? "#333" : COLORS.warmSand}`, padding: "36px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 0, maxWidth: 900, margin: "0 auto" }}>
          {[["1,284", "Meals rescued"], ["642 kg", "Food from landfills"], ["47", "NGOs active"], ["Ranchi", "& growing"]].map(([n, l], i) => (
            <div key={l} style={{ flex: 1, textAlign: "center", padding: "0 24px", borderRight: i < 3 ? `1px solid ${COLORS.warmSand}` : "none" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: dark ? "#f5f5f5" : COLORS.charcoal, fontFamily: "Georgia, serif" }}>{n}</div>
              <div style={{ fontSize: 13, color: dark ? "#9CA3AF" : COLORS.slate, marginTop: 4 }}>{l}</div>
              <div style={{ fontSize: 11, color: COLORS.indiaGreen, fontWeight: 700, marginTop: 4 }}>↑ this month</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live listings preview */}
      <section style={{ padding: "72px 80px", maxWidth: 1280, margin: "0 auto", background: dark ? "#111" : "transparent" }}>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: COLORS.blushRed, borderRadius: 999, fontSize: 11, fontWeight: 700, color: COLORS.alertRed, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.alertRed, display: "inline-block", animation: "urgentPulse 1.5s infinite" }} /> LIVE NOW
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: dark ? "#f5f5f5" : COLORS.charcoal, fontFamily: "Georgia, serif" }}>Food available in Ranchi</div>
          </div>
          <button onClick={() => setActivePage("browse")} style={{ marginLeft: "auto", padding: "10px 20px", background: "none", border: `1.5px solid ${COLORS.saffron}`, color: COLORS.saffron, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>See all →</button>
        </div>
        <div className="landing-grid3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {listings.filter(l => l.expiry > 0).slice(0, 3).map(l => (
            <FoodCard key={l.id} listing={l} onReserve={() => setLoginRole("ngo")} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: dark ? "#1a1a1a" : "#fff", padding: "72px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.saffron, letterSpacing: 2, marginBottom: 10 }}>SIMPLE BY DESIGN</div>
          <div className="howto-title" style={{ fontSize: 42, fontWeight: 800, color: dark ? "#f5f5f5" : COLORS.charcoal, fontFamily: "Georgia, serif", lineHeight: 1.2 }}>From surplus to table in minutes</div>
          <div style={{ fontSize: 18, color: dark ? "#9CA3AF" : COLORS.slate, marginTop: 14, maxWidth: 560, margin: "14px auto 0" }}>A seamless two-sided platform connecting food donors with NGOs across Ranchi</div>
        </div>
        <div className="landing-howto" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
          {[
            { title: "For Donors",  emoji: "🍽️", steps: ["📸 Take a quick photo", "📝 Fill 4 quick fields", "🤝 Choose your offer", "🚀 Publish — NGOs are notified instantly"] },
            { title: "For NGOs",    emoji: "🤝", steps: ["🗺 Browse nearby listings on the map", "🔍 Filter by type, urgency & distance", "✅ Reserve in one click", "📦 Pickup with a secure confirmation code"] },
          ].map(({ title, emoji, steps }) => (
            <div key={title} style={{ background: dark ? "#242424" : COLORS.warmIvory, borderRadius: 24, padding: "32px 36px", border: `1px solid ${dark ? "#333" : COLORS.warmSand}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: COLORS.saffronGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{emoji}</div>
                <div className="howto-section-title" style={{ fontSize: 20, fontWeight: 800, color: dark ? "#f5f5f5" : COLORS.charcoal, fontFamily: "Georgia, serif" }}>{title}</div>
              </div>
              {steps.map((step, i) => (
                <div key={step} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
                  <div className="howto-step-num" style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.saffron, border: `2px solid ${COLORS.deepSaffron}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0, boxShadow: `0 4px 12px ${COLORS.saffron}40` }}>{i + 1}</div>
                  <div className="howto-step-text" style={{ fontSize: 16, color: dark ? "#d1d5db" : COLORS.charcoal, paddingTop: 10, lineHeight: 1.5 }}>{step}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: COLORS.charcoal, color: "#fff", padding: "48px 80px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="landing-footer-cols" style={{ display: "flex", gap: 60, marginBottom: 36 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.saffron, marginBottom: 8, fontFamily: "Georgia, serif" }}>🌾 BharatMap</div>
              <div style={{ fontSize: 13, color: COLORS.ash }}>Har khana kisi ke kaam aaye</div>
              <div style={{ fontSize: 12, color: COLORS.ash, marginTop: 8 }}>Made with ❤️ for Bharat</div>
            </div>
            {[
              ["Platform", ["Browse listings", "List food", "For NGOs", "Impact"]],
              ["Cities",   ["Ranchi ✓", "Jamshedpur (soon)", "Dhanbad (soon)", "Bokaro (soon)"]],
              ["About",    ["How it works", "Food safety", "NGO verification", "Contact"]],
            ].map(([heading, links]) => (
              <div key={heading}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.ash, letterSpacing: 1.5, marginBottom: 14 }}>{String(heading).toUpperCase()}</div>
                {links.map(l => {
                  const action =
                    l === "Browse listings" ? () => setActivePage("browse") :
                    l === "List food" ? () => setLoginRole("restaurant") :
                    l === "For NGOs" ? () => setLoginRole("ngo") :
                    undefined;
                  return (
                    <div key={l} onClick={action}
                      style={{ fontSize: 13, color: action ? COLORS.ash : COLORS.slate, marginBottom: 8, cursor: action ? "pointer" : "default", transition: "color 0.2s" }}
                      onMouseEnter={action ? e => { e.currentTarget.style.color = "#fff"; } : undefined}
                      onMouseLeave={action ? e => { e.currentTarget.style.color = COLORS.ash; } : undefined}>
                      {l}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #333", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* FIX: dynamic year */}
            <div style={{ fontSize: 11, color: COLORS.ash }}>© {new Date().getFullYear()} BharatMap — Built for Bharat</div>
            <div style={{ fontSize: 11, color: COLORS.ash }}>Privacy · Terms · Food Safety</div>
          </div>
        </div>
      </footer>

      {loginRole && <LoginModal role={loginRole} onClose={() => setLoginRole(null)} onLogin={handleLogin} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT — FIX: setListings passed down; efficient countdown
// ─────────────────────────────────────────────
export default function App() {
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [dark, setDark] = useState(false);
  // Shared reservations so restaurant can verify NGO pickup codes
  const [sharedReservations, setSharedReservations] = useState([]);

  // Efficient countdown — skip already-expired; stop when all done
  useEffect(() => {
    const idRef = { current: null };
    idRef.current = setInterval(() => {
      setListings(prev => {
        const allDone = prev.every(l => l.expiry <= -1);
        if (allDone) {
          clearInterval(idRef.current);
          return prev;
        }
        return prev.map(l => {
          if (l.expiry <= -1) return l;
          const newExpiry = Math.max(l.expiry - 1, -1);
          return { ...l, expiry: newExpiry, urgent: newExpiry > 0 && newExpiry < 90 };
        });
      });
    }, 60000);
    return () => clearInterval(idRef.current);
  }, []);

  const handleAddListing = useCallback((newListing) => {
    setListings(prev => [newListing, ...prev]);
  }, []);

  const handleToggleDark = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      document.body.style.background = next ? "#111" : "";
      return next;
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#111" : COLORS.warmIvory, transition: "background 0.3s" }}>
      <style>{GLOBAL_STYLES}</style>
      <LandingPage
        listings={listings}
        setListings={setListings}
        onAddListing={handleAddListing}
        dark={dark}
        onToggleDark={handleToggleDark}
        sharedReservations={sharedReservations}
        onSharedReservation={setSharedReservations}
      />
    </div>
  );
}
