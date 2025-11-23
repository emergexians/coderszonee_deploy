// lib/razorpay.ts
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

if (!keyId || !keySecret) {
  throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars");
}

export const razorpayClient = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function createRazorpayOrder(amountInPaise: number, currency = "INR", receipt?: string) {
  const options = {
    amount: amountInPaise,
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1, // auto capture
  };
  return razorpayClient.orders.create(options);
}
