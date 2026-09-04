const variants = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  loading = false,
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={`${variants[variant] || variants.primary} ${className} ${
        loading || disabled ? "cursor-not-allowed opacity-70" : ""
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </Component>
  );
}
