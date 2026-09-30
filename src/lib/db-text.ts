export function dbText(value?: string | null): string {
  if (!value) return "";
  return value.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
}

export function dbTextClassName(className = "") {
  return ["whitespace-pre-line", className].filter(Boolean).join(" ");
}
