/** Domain shared by at least two addresses. A later address wins a tie. */
export function sharedDomain(emails: string[]): string | null {
  const counts = new Map<string, number>();
  for (const email of emails) {
    const domain = domainOf(email);
    if (!domain) continue;
    counts.set(domain, (counts.get(domain) ?? 0) + 1);
  }
  for (let i = emails.length - 1; i >= 0; i--) {
    const domain = domainOf(emails[i]);
    if (domain && (counts.get(domain) ?? 0) >= 2) return domain;
  }
  return null;
}

/** When @ is typed on a local part, append a domain already used twice. */
export function applyDomain(previous: string, next: string, domain: string | null): string {
  if (!domain) return next;
  if (next.length !== previous.length + 1) return next;
  const at = next.lastIndexOf('@');
  if (at < 1 || next.slice(at + 1) !== '') return next;
  const local = next.slice(0, at);
  if (previous !== local) return next;
  return `${local}@${domain}`;
}

function domainOf(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 1) return null;
  const domain = trimmed.slice(at + 1);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return null;
  return domain;
}
