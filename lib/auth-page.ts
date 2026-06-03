export const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getAuthRedirectTarget(redirectTo: string | null) {
  return redirectTo || DEFAULT_AUTH_REDIRECT;
}

export function getAlternateAuthHref(pathname: "/login" | "/signup", redirectTo: string) {
  if (redirectTo === DEFAULT_AUTH_REDIRECT) {
    return pathname;
  }

  return `${pathname}?redirectTo=${encodeURIComponent(redirectTo)}`;
}