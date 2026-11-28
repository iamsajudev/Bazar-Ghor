// data/cancellationInfo.ts

export interface CancellationStep {
  step: string;
  title: string;
  description: string;
}

export interface CancellationPolicyCard {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

export interface CancellationFaqItem {
  question: string;
  answer: string;
}

export const CANCELLATION_META = {
  badge: "Order Cancellation Guide",
  title: "Order Cancellation Policy",
  subtitle:
    "Clear guidelines on when you can cancel an order, how to request cancellation, and what happens with payments or stock holds.",
  highlights: [
    { label: "Best Window", value: "Before Dispatch" },
    { label: "Eligible Statuses", value: "Placed / Unpaid" },
    { label: "Cancellation Fee", value: "৳0 / Free" },
    { label: "Refund Processing", value: "3 – 7 Business Days" },
  ],
};

export const CANCELLATION_STEPS: CancellationStep[] = [
  {
    step: "01",
    title: "Locate Your Order",
    description:
      "Sign in to your account and open My Orders, or keep your order number handy if you placed a guest order.",
  },
  {
    step: "02",
    title: "Check Dispatch Status",
    description:
      "Verify that the order has not yet been packed, invoiced for courier handover, or shipped out.",
  },
  {
    step: "03",
    title: "Submit Cancellation",
    description:
      "Cancel directly from your order details if eligible, or contact our support team quickly with your order number.",
  },
  {
    step: "04",
    title: "Confirmation & Refund",
    description:
      "Once canceled, your order status updates to canceled and any paid amount is refunded per our refund terms.",
  },
];

export const CANCELLATION_POLICY_CARDS: CancellationPolicyCard[] = [
  {
    id: "when-cancellable",
    title: "When Orders Can Be Canceled",
    summary:
      "Direct cancellation is supported smoothly before fulfillment progresses to courier dispatch.",
    points: [
      "Orders in placed or pending_payment state that are still unpaid can generally be canceled directly.",
      "Stock reservations held for your order are released once cancellation is completed.",
      "Reaching out promptly increases the chance of stopping fulfillment even during early processing.",
    ],
  },
  {
    id: "after-dispatch",
    title: "After Packing or Dispatch",
    summary:
      "Once a parcel enters transit with a delivery partner, standard return or refusal rules apply.",
    points: [
      "If an order has already been shipped or handed over to the courier, instant online cancellation may no longer be available.",
      "For damaged, wrong, or unwanted items after delivery, please check our Refund & Return guidelines.",
      "Any shipping charges already incurred on dispatched shipments are handled according to policy.",
    ],
  },
  {
    id: "refunds-preorders",
    title: "Refunds & Pre-Order Items",
    summary:
      "Transparent handling for online payments and reserved pre-order batches.",
    points: [
      "If you paid online for an eligible canceled order, the refund is initiated back to the original payment method.",
      "Bank, card, or wallet settlement times vary depending on the payment provider or gateway.",
      "Pre-order items can generally be canceled prior to batch dispatch; see our Pre-Order page for batch details.",
    ],
  },
];

export const CANCELLATION_FAQS: CancellationFaqItem[] = [
  {
    question: "Is there any fee to cancel an eligible order?",
    answer:
      "No. Canceling an eligible order before it is packed or dispatched does not carry a cancellation fee.",
  },
  {
    question: "How long does it take to receive a refund after cancellation?",
    answer:
      "Once a refund is approved and initiated on an eligible paid order, it typically takes 3 to 7 business days to reflect depending on your payment method or bank.",
  },
  {
    question: "Can I cancel a single item instead of the whole order?",
    answer:
      "If your order has not yet been dispatched, please contact our support team right away with your order number and item details so we can assist you before packing completes.",
  },
  {
    question: "What if I changed my mind right after placing an order?",
    answer:
      "Contact us as soon as possible with your order number. The earlier you request cancellation after placing the order, the easier it is to stop fulfillment.",
  },
];