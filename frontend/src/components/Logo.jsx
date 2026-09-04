import { Link } from "react-router-dom";

export default function Logo({ light = false, className = "" }) {
  return (
    <Link to="/" className={`flex items-center select-none ${className}`}>
      <img
        src="/images/brand/logo.png"
        alt="GADCO ZEN"
        className={`h-11 w-auto object-contain sm:h-14 ${light ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
