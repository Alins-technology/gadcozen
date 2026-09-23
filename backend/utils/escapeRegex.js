// Escapes user input before it's used in a RegExp, so a search term like
// "(a+)+" can't be used for regex injection / ReDoS.
export const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
