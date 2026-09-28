# 써본사람 architecture

Next.js App Router → server actions / route handlers → Supabase Auth + PostgreSQL RLS + private Storage.
The browser uses an anonymous public key and the user's cookie session. Service-role secrets are not used for normal application requests. Every private read and write is authorized by database policy, not UI visibility.

## Domain boundaries

- Identity: profiles, Auth identities, onboarding. Public profile fields contain no email or real-name requirement.
- Community: clubs, memberships, role-gated invitations. Club creation and invite acceptance are atomic database functions. Private members are visible only to active members.
- Experience: products represent canonical catalog entries; user_gears represent ownership and context. Only gear visibility determines access to the experience. Questions inherit club visibility.
- Commerce: merchants, offers, providers, affiliate links, click events and conversions are independent of ranking. External provider adapters return explicit disabled states when unimplemented or unconfigured.
- Operations: audit_logs, reports, events. Administrator assignment requires a database operator; user metadata cannot elevate privileges.

## Trust boundaries

RLS is enabled on every public table. SECURITY DEFINER functions have a fixed search_path and explicit actor checks. Authenticated users cannot update membership roles or their own administrator flag. Private images live in a private bucket and are read via RLS-bound signed URLs. URLs accept only public HTTPS hosts; URL import never fetches arbitrary pages. No scraping or simulated affiliate success.

## Delivery scope

See STATUS.md for implemented flows, validation, and deliberate follow-up work. An unconfigured installation offers a clearly labelled, read-only demo and setup instructions, never simulated successful persistence.
