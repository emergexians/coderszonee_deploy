// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/db"; // or dbConnect
import Payment from "@/models/Payments";
import Enrollment from "@/models/Enrollment";

type ReqBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paymentId?: string; // local Payment doc id if present
  enrollmentId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
      enrollmentId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing razorpay fields" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      // signature mismatch — mark local payment if known
      await dbConnect();
      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: "failed",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        }).exec();
      }
      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 400 }
      );
    }

    // verified
    await dbConnect();

    // locate payment doc (prefer by local id, else by razorpayOrderId)
    let paymentDoc = null;
    if (paymentId) paymentDoc = await Payment.findById(paymentId).exec();
    if (!paymentDoc)
      paymentDoc = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      }).exec();

    if (!paymentDoc) {
      // fallback: create a payment doc (rare)
      paymentDoc = await Payment.create({
        enrollmentId: enrollmentId || null,
        amountInPaise: 0,
        currency: "INR",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      });
      // mark enrollment paid if enrollmentId known
      if (enrollmentId) {
        await Enrollment.findByIdAndUpdate(enrollmentId, {
          status: "paid",
        }).exec();
      }
      return NextResponse.json({
        success: true,
        paymentId: String(paymentDoc._id),
      });
    }

    // update payment doc
    paymentDoc.razorpayPaymentId = razorpay_payment_id;
    paymentDoc.razorpaySignature = razorpay_signature;
    paymentDoc.status = "paid";
    await paymentDoc.save();

    // mark the linked enrollment as paid (if available)
    if (paymentDoc.enrollmentId) {
      await Enrollment.findByIdAndUpdate(paymentDoc.enrollmentId, {
        status: "paid",
      }).exec();
    } else if (enrollmentId) {
      await Enrollment.findByIdAndUpdate(enrollmentId, {
        status: "paid",
      }).exec();
    }

    return NextResponse.json({
      success: true,
      paymentId: String(paymentDoc._id),
    });
  } catch (err: unknown) {
    console.error("verify error", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
