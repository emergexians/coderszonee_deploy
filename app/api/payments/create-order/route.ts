// app/api/payments/create-order/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payments";
import { createRazorpayOrder } from "@/lib/razorpay";

type ReqBody = {
  enrollmentId: string;
  email?: string;
};

type EnrollmentLean = {
  _id: string;
  userEmail: string;
  courseType: string;
  courseSlug: string;
  status?: string;
  amount?: number;
  currency?: string;
  meta?: Record<string, unknown>;
};

function shortId(id: unknown, len = 8) {
  const s = String(id ?? "");
  return s.length <= len ? s : s.slice(-len);
}

/** Build a receipt string guaranteed to be <= 40 chars and safe */
function buildReceipt(enrollmentId: string, paymentId: string) {
  // structure: enroll_<last8(enroll)>_<last8(pay)>
  const r = `enroll_${shortId(enrollmentId)}_${shortId(paymentId)}`;
  return r.length <= 40 ? r : r.slice(0, 40);
}

// Define Razorpay order response type
type RazorpayOrderResponse = {
  id: string;
  amount: number | string; // Razorpay returns number|string
  currency: string;
};

// Helper type guards for Razorpay error shapes
type RazorpayInnerError = {
  description?: unknown;
  [key: string]: unknown;
};

type RazorpayErrorWrapper = {
  error?: unknown;
  [key: string]: unknown;
};

function isRazorpayErrorWrapper(val: unknown): val is RazorpayErrorWrapper {
  return typeof val === "object" && val !== null && "error" in val;
}

function isRazorpayInnerError(val: unknown): val is RazorpayInnerError {
  return typeof val === "object" && val !== null && "description" in val;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.enrollmentId) {
      return NextResponse.json(
        { error: "Missing enrollmentId" },
        { status: 400 }
      );
    }

    await dbConnect();

    // fetch enrollment as plain object
    const enrollment = await Enrollment.findById(body.enrollmentId)
      .lean<EnrollmentLean>()
      .exec();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    if (
      enrollment.amount == null ||
      typeof enrollment.amount !== "number" ||
      enrollment.amount <= 0
    ) {
      return NextResponse.json(
        { error: "Enrollment amount not set or invalid" },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(enrollment.amount * 100);
    const currency = (enrollment.currency || "INR").toUpperCase();

    // Reuse an existing created payment if available
    const existing = await Payment.findOne({
      enrollmentId: enrollment._id,
      status: "created",
    }).exec();

    if (existing) {
      if (existing.razorpayOrderId) {
        return NextResponse.json({
          orderId: existing.razorpayOrderId,
          amount: existing.amountInPaise,
          currency: existing.currency,
          key:
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
            process.env.RAZORPAY_KEY_ID,
          paymentId: String(existing._id),
        });
      }
    }

    // create a local Payment doc first
    const paymentDoc = await Payment.create({
      enrollmentId: enrollment._id,
      amountInPaise,
      currency,
      status: "created",
    });

    const receipt = buildReceipt(
      String(enrollment._id),
      String(paymentDoc._id)
    );

    // create razorpay order
    let order: RazorpayOrderResponse;
    try {
      order = await createRazorpayOrder(amountInPaise, currency, receipt);
    } catch (rpErr: unknown) {
      paymentDoc.status = "failed";
      paymentDoc.razorpayOrderId = undefined;
      await paymentDoc.save();

      // unwrap Razorpay error if present
      const rpError = isRazorpayErrorWrapper(rpErr) ? rpErr.error : rpErr;

      console.error("create order razorpay error", rpErr);

      const details =
        isRazorpayInnerError(rpError) &&
        typeof rpError.description === "string"
          ? rpError.description
          : (() => {
              try {
                return JSON.stringify(rpError);
              } catch {
                return String(rpError);
              }
            })();

      return NextResponse.json(
        {
          error: "Razorpay order creation failed",
          details,
        },
        { status: 400 }
      );
    }

    // persist razorpay order id
    paymentDoc.razorpayOrderId = order.id;
    await paymentDoc.save();

    return NextResponse.json({
      orderId: order.id,
      amount: Number(order.amount), // ✅ normalize to number
      currency: order.currency,
      key:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID,
      paymentId: String(paymentDoc._id),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("create-order error", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
