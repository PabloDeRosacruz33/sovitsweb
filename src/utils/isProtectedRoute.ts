export function isProtectedRoute(pathname: string): boolean {
  if (
    pathname.includes("home") ||
    pathname.includes("onboarding") ||
    pathname.includes("auth/verification")
  ) {
    return true;
  }

  return false;
}
