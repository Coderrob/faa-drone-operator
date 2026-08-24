export function sitePath(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`.replace(/\/{2,}/g, "/");
}

export const repositoryUrl = "https://github.com/Coderrob/faa-drone-operator";
