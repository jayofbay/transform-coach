import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockPricesCreate,
  mockPaymentLinksCreate,
  mockConstructEvent,
  mockInsert,
  mockSelect,
  mockSingle,
  mockFrom,
  mockInvoiceUpdate,
  mockInvoiceEq,
} = vi.hoisted(() => ({
  mockPricesCreate: vi.fn(),
  mockPaymentLinksCreate: vi.fn(),
  mockConstructEvent: vi.fn(),
  mockInsert: vi.fn(),
  mockSelect: vi.fn(),
  mockSingle: vi.fn(),
  mockFrom: vi.fn(),
  mockInvoiceUpdate: vi.fn(),
  mockInvoiceEq: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    constructor() {
      this.prices = { create: mockPricesCreate };
      this.paymentLinks = { create: mockPaymentLinksCreate };
      this.webhooks = { constructEvent: mockConstructEvent };
    }
  },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

function createRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
  return res;
}

describe("create-invoice API", () => {
  let handler;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    mockPricesCreate.mockResolvedValue({ id: "price_123" });
    mockPaymentLinksCreate.mockResolvedValue({ id: "plink_123", url: "https://pay.stripe.com/test" });
    mockSingle.mockResolvedValue({
      data: { id: "inv_1", status: "pending", stripe_payment_link_url: "https://pay.stripe.com/test" },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert });

    vi.resetModules();
    ({ default: handler } = await import("./create-invoice.js"));
  });

  it("handles OPTIONS preflight", async () => {
    const res = createRes();
    await handler({ method: "OPTIONS" }, res);
    expect(res.statusCode).toBe(200);
    expect(res.ended).toBe(true);
  });

  it("rejects non-POST methods", async () => {
    const res = createRes();
    await handler({ method: "GET" }, res);
    expect(res.statusCode).toBe(405);
  });

  it("validates required invoice fields", async () => {
    const res = createRes();
    await handler({ method: "POST", body: { thread_id: "jordan-blake" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("creates Stripe price, payment link, and Supabase invoice", async () => {
    const res = createRes();
    await handler({
      method: "POST",
      body: {
        thread_id: "jordan-blake",
        amount_cents: 9900,
        description: "Monthly coaching",
        due_date: "2026-07-01",
      },
    }, res);

    expect(res.statusCode).toBe(200);
    expect(mockPricesCreate).toHaveBeenCalledWith({
      unit_amount: 9900,
      currency: "usd",
      product_data: { name: "Monthly coaching" },
    });
    expect(mockPaymentLinksCreate).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith("invoices");
    expect(res.body.invoice.status).toBe("pending");
  });
});

describe("stripe-webhook API", () => {
  let handler;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";

    mockInvoiceEq.mockResolvedValue({ data: null, error: null });
    mockInvoiceUpdate.mockReturnValue({ eq: mockInvoiceEq });
    mockFrom.mockReturnValue({ update: mockInvoiceUpdate });

    vi.resetModules();
    ({ default: handler } = await import("./stripe-webhook.js"));
  });

  function createReq(body, headers = {}) {
    return {
      method: "POST",
      headers,
      on(event, cb) {
        if (event === "data") cb(Buffer.from(body));
        if (event === "end") cb();
      },
    };
  }

  it("rejects non-POST methods", async () => {
    const res = createRes();
    await handler({ method: "GET" }, res);
    expect(res.statusCode).toBe(405);
  });

  it("rejects invalid webhook signatures", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const res = createRes();
    await handler(createReq("{}", { "stripe-signature": "bad" }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Webhook error/i);
  });

  it("marks invoice paid on checkout.session.completed", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          payment_link: "plink_123",
          payment_intent: "pi_123",
        },
      },
    });

    const res = createRes();
    await handler(createReq("{}", { "stripe-signature": "valid" }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.received).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("invoices");
    expect(mockInvoiceUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "paid", stripe_payment_intent_id: "pi_123" })
    );
    expect(mockInvoiceEq).toHaveBeenCalledWith("stripe_payment_link_id", "plink_123");
  });
});
