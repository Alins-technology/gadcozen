// Product photos are stored as ~2 MB PNGs. scripts/optimize-images.mjs
// creates -200/-600/-1200 WebP copies next to each one (30–100 KB). These
// helpers point <img> tags at the right size, and fall back to the original
// file if a WebP copy doesn't exist yet (e.g. a newly added photo).

const WIDTHS = [200, 600, 1200];

const pickWidth = (width) => WIDTHS.find((w) => w >= width) || WIDTHS[WIDTHS.length - 1];

export const imageUrl = (src, width = 600) => {
  if (!src) return src;
  const w = pickWidth(width);

  if (src.startsWith("/images/products/") && /\.(png|jpe?g)$/i.test(src)) {
    return src.replace(/\.(png|jpe?g)$/i, `-${w}.webp`);
  }
  // Cloudinary uploads: let Cloudinary resize and pick WebP/AVIF itself.
  if (src.includes("res.cloudinary.com") && src.includes("/upload/") && !src.includes("/upload/f_auto")) {
    return src.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);
  }
  return src;
};

// Spread onto an <img>: <img {...imgProps(product.images[0], 600)} alt="" />
export const imgProps = (src, width = 600) => ({
  src: imageUrl(src, width),
  decoding: "async",
  onError: (e) => {
    if (src && e.currentTarget.src !== new URL(src, window.location.origin).href) {
      e.currentTarget.src = src;
    }
  },
});
