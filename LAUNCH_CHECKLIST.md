# Launch Checklist

## Required manual configuration before deployment

1. Add real Supabase credentials to the production environment:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   - SUPABASE_SERVICE_ROLE_KEY

2. Configure the production domain:
   - NEXT_PUBLIC_SITE_URL

3. Configure Lemon Squeezy production credentials:
   - LEMONSQUEEZY_API_KEY
   - LEMONSQUEEZY_STORE_ID
   - LEMONSQUEEZY_WEBHOOK_SECRET

4. Configure the storage bucket used for product files and downloads.

5. Configure an email provider for auth emails and password reset flows.

6. Verify the Supabase project has the required tables and policies:
   - products
   - product_files
   - orders
   - order_items
   - founder_emails

7. Verify the public and private access rules for product files and founder-only routes.

8. Verify the webhook endpoint URL in Lemon Squeezy matches:
   - https://your-domain.com/api/webhooks/lemonsqueezy

9. Verify the redirect URL for Supabase auth matches the deployed callback route:
   - /auth/callback

10. Run a final deployment smoke test for sign-in, sign-up, checkout, download access, and admin access.
