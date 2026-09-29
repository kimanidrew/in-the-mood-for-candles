export function slugifyProductName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function skuFromProductName(value: string) {
  const slug = slugifyProductName(value);
  return slug ? `IMC-${slug.toUpperCase()}` : "";
}
