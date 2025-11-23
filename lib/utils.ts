// lib/utils.ts
export function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}
