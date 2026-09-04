import LegalLayout from "../../components/LegalLayout.jsx";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy">
      <p>
        This website uses cookies and similar technologies (including browser local storage) to
        keep you logged in, remember your cart, and understand how the site is used.
      </p>
      <h3 className="font-display text-lg text-ink-900">Essential Cookies/Storage</h3>
      <p>
        Used to keep you signed in and to remember items in your cart while you browse — required
        for the site to function.
      </p>
      <h3 className="font-display text-lg text-ink-900">Managing Cookies</h3>
      <p>
        You can control or delete cookies through your browser settings. Disabling essential
        cookies may affect site functionality such as staying logged in or keeping items in your
        cart.
      </p>
    </LegalLayout>
  );
}
