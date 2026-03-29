import { loadStripe, type Stripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Singleton Stripe.js instance for Payment Element. Call only when
 * VITE_STRIPE_PUBLISHABLE_KEY is set.
 */
export function getStripePromise(): Promise<Stripe | null> | null {
  if (!publishableKey?.trim()) {
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

export function hasStripePublishableKey(): boolean {
  return Boolean(publishableKey?.trim());
}
