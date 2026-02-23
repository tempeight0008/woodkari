/**
 * Create Admin User Script
 * Run with: bun supabase/create-admin.ts
 *
 * Creates an admin user in Supabase Auth and sets their profile role to 'admin'.
 * Edit the credentials below before running.
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://qsyvaurimzdmmbnviocl.supabase.co"
const SERVICE_ROLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzeXZhdXJpbXpkbW1ibnZpb2NsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4NTM3NiwiZXhwIjoyMDg3MTYxMzc2fQ.bKdmUAtRHolQVyXwEFFLJgJm3eBhnHPDvaR5wH89oB8"

// ── Edit these before running ─────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@woodkari.com"
const ADMIN_PASSWORD = "ChangeMe123!"      // use a strong password
const ADMIN_NAME = "Woodkari Admin"
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
    console.log(`Creating admin user: ${ADMIN_EMAIL}`)

    // 1. Create the user in Supabase Auth (using admin API)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,          // skip the confirmation email
        user_metadata: { full_name: ADMIN_NAME },
    })

    if (authError) {
        // If the user already exists, just promote them
        if (authError.message.includes("already been registered") || authError.code === "email_exists") {
            console.log("User already exists — promoting to admin role...")
        } else {
            console.error("Failed to create auth user:", authError.message)
            process.exit(1)
        }
    } else {
        console.log("Auth user created:", authData.user.id)
    }

    // 2. Look up the user to get their id
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) { console.error("Failed to list users:", listError.message); process.exit(1) }

    const user = users.find(u => u.email === ADMIN_EMAIL)
    if (!user) { console.error("Could not find user after creation"); process.exit(1) }

    // 3. Set profile role to 'admin'
    const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, email: ADMIN_EMAIL, full_name: ADMIN_NAME, role: "admin" }, { onConflict: "id" })

    if (profileError) {
        console.error("Failed to set admin role:", profileError.message)
        process.exit(1)
    }

    console.log("✅ Admin user ready!")
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`   Role:     admin`)
}

main()
