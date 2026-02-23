/**
 * Admin authentication is handled entirely by Supabase Auth.
 * See:
 *   - app/auth/actions.ts  — login / logout / password reset server actions
 *   - app/admin/layout.tsx — server-side role guard (profiles.role === 'admin')
 *   - proxy.ts             — middleware role guard for all /admin/* routes
 *
 * This file is kept as a placeholder for any future shared auth utilities.
 */

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "editor"
}
