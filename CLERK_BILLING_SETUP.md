# Clerk Billing Setup Instructions

The checkout is now using Clerk's **real billing system** instead of mock payments. To make this work properly, you need to configure Clerk billing in your dashboard.

## ⚠️ Current Issue
- Users still see "Free Plan" after payment because Clerk billing isn't configured
- The `has({ plan: "pro" })` and `has({ feature: "unlimited_decks" })` checks return false
- Real Clerk billing setup is required for production functionality

## 🔧 Required Setup Steps

### 1. Configure Clerk Billing in Dashboard
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your project
3. Go to **Billing** → **Subscriptions**
4. Set up your billing provider (Stripe recommended)
5. Create billing plans:
   - `free_user` - Free plan (default)
   - `pro` - Premium plan ($20/month)

### 2. Configure Billing Features
Create these features in Clerk:
- `3_deck_limit` - Assigned to `free_user` plan
- `unlimited_decks` - Assigned to `pro` plan  
- `ai_flashcard_generation` - Assigned to `pro` plan

### 3. Environment Variables
Add to your `.env.local`:
```env
# These should already exist
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Billing webhook endpoint (if using webhooks)
CLERK_WEBHOOK_SECRET=whsec_...
```

### 4. Test the Billing
1. The `PricingTable` component will now show real Stripe checkout
2. Users can make actual test payments using Stripe test cards
3. Billing status will be updated automatically in Clerk
4. Dashboard will show correct "Pro Plan" status

## 🧪 Development Testing

For **development testing without real billing setup**, you can temporarily:

1. **Manually assign Pro plan to test user:**
   - Go to Clerk Dashboard → Users
   - Select your test user
   - Go to "Subscriptions" tab
   - Manually assign "pro" plan

2. **Use Clerk's test mode:**
   - Enable test mode in Clerk billing settings
   - Use test payment methods

## 📁 Updated Files

- `src/components/checkout-dialog.tsx` - Now uses real `PricingTable`
- `src/app/pricing/page.tsx` - Real Clerk billing integration
- `src/app/dashboard/page.tsx` - Shows actual plan status ("Pro Plan" vs "Free Plan")

## ✅ Expected Result

After proper Clerk billing setup:
- ✅ Payment will actually update user's billing status
- ✅ Dashboard shows "Pro Plan" badge for paid users
- ✅ Unlimited deck creation works for Pro users
- ✅ Free users still see 3-deck limit warnings

---

**Next Step:** Configure Clerk billing in your dashboard to make payments actually upgrade users to Pro plan.