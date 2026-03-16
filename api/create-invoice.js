import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS headers for same-project calls
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { thread_id, amount_cents, description, due_date } = req.body;

  if (!thread_id || !amount_cents || !description) {
    return res.status(400).json({ error: "thread_id, amount_cents, and description are required" });
  }

  try {
    // 1. Create a one-time Stripe Price
    const price = await stripe.prices.create({
      unit_amount: amount_cents,
      currency: "usd",
      product_data: { name: description },
    });

    // 2. Create a Payment Link (client opens this to pay via card or bank ACH)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: "redirect",
        redirect: { url: `https://client-plan.vercel.app?client=${thread_id}&payment=success` },
      },
    });

    // 3. Save invoice to Supabase
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        thread_id,
        amount_cents,
        currency: "usd",
        description,
        due_date: due_date || null,
        status: "pending",
        stripe_payment_link_id: paymentLink.id,
        stripe_payment_link_url: paymentLink.url,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ invoice: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
