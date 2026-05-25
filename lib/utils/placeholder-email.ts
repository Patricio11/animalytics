/**
 * Helpers for placeholder email addresses.
 *
 * When an admin creates a breeder before they have the real email, we generate
 * a placeholder like `noemail-abc123@placeholder.animalytics.co`. The record is
 * complete in the DB, but the user cannot sign in or receive emails until the
 * admin updates the address from the user detail page.
 */

export const PLACEHOLDER_EMAIL_DOMAIN = 'placeholder.animalytics.co';

/**
 * Generate a unique placeholder email address for an admin-created user
 * whose real email isn't known yet.
 */
export function generatePlaceholderEmail(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `noemail-${ts}${random}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

/**
 * True if the given email is a system-generated placeholder.
 * Used to skip emails sends and badge the user in the UI.
 */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}
