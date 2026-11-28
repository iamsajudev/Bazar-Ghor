// data/howToOrderInfo.ts

export interface OrderStepItem {
  step: string;
  title: string;
  description: string;
}

export interface OrderTipCard {
  id: string;
  title: string;
  summary: string;
  points: string[];
}

export interface OrderFaqItem {
  question: string;
  answer: string;
}

export const HOW_TO_ORDER_META = {
  badge: "Shopping Guide",
  title: "How to Order",
  subtitle:
    "Follow our simple step-by-step guide to browse products, calculate shipping, place your order smoothly, and track your delivery.",
  highlights: [
    { label: "Checkout Options", value: "Guest & Account" },
    { label: "Payment Methods", value: "COD & Online" },
    { label: "Live Totals", value: "Server Verified" },
    { label: "Order Tracking", value: "Real-Time Status" },
  ],
};

export const HOW_TO_ORDER_STEPS: OrderStepItem[] = [
  {
    step: "01",
    title: "Browse & Search Products",
    description:
      "Explore categories, brands, deals, or new arrivals, and use search or filters to find the exact item you need.",
  },
  {
    step: "02",
    title: "Select Variant & Add to Cart",
    description:
      "Pick your preferred option or variant (if applicable), set the quantity, and add the item to your shopping cart.",
  },
  {
    step: "03",
    title: "Review Cart & Shipping",
    description:
      "Open your cart to adjust quantities, apply a promo code if available, and check shipping options for your location.",
  },
  {
    step: "04",
    title: "Enter Delivery Details",
    description:
      "Provide your recipient name, contact number, email, and complete street/area address so your parcel reaches smoothly.",
  },
  {
    step: "05",
    title: "Choose Payment & Confirm",
    description:
      "Select Cash on Delivery or an available online payment option, review the final total, and place your order.",
  },
  {
    step: "06",
    title: "Track Your Delivery",
    description:
      "Save your order number to follow status updates from order confirmation and packing to final delivery.",
  },
];

export const HOW_TO_ORDER_TIPS: OrderTipCard[] = [
  {
    id: "guest-vs-account",
    title: "Guest vs. Account Checkout",
    summary:
      "Order quickly as a guest or sign in to keep everything organized under your profile.",
    points: [
      "Guest checkout lets you place an order without creating an account first.",
      "Signing in lets you view past orders, manage saved addresses, and track order history easily.",
      "Any eligible guest orders matching your email can also be linked when signing in.",
    ],
  },
  {
    id: "accurate-address",
    title: "Delivery Address & Contact",
    summary:
      "Complete address and reachable phone details help couriers deliver without delays.",
    points: [
      "Include house/flat number, road/street, area, city, and postal code clearly.",
      "Keep your phone number active so delivery riders can coordinate arrival.",
      "Double-check shipping method selection before confirming your final order.",
    ],
  },
  {
    id: "after-placing",
    title: "After You Place an Order",
    summary:
      "Know how to check status, make changes, or reach support if something comes up.",
    points: [
      "Keep your order number handy for tracking on the Track Order page or in your account.",
      "Need to cancel or modify before dispatch? Contact support or check our Cancellation Policy.",
      "Have product or bulk questions? Reach out via our Contact page anytime.",
    ],
  },
];

export const HOW_TO_ORDER_FAQS: OrderFaqItem[] = [
  {
    question: "Do I need an account to place an order?",
    answer:
      "No, you can place an order as a guest by entering your contact and delivery details at checkout, or log in to use saved addresses and order history.",
  },
  {
    question: "How can I apply a discount or coupon code?",
    answer:
      "If you have a valid coupon code, enter it during cart or checkout quote calculation so the discount is reflected in your order summary.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Available payment options depend on your cart, destination, and active checkout configuration—commonly including Cash on Delivery (COD) and supported online gateways.",
  },
  {
    question: "How do I check my order status after ordering?",
    answer:
      "Visit the Track Order page and enter your order number (along with your guest token if tracking as a guest), or check your orders inside your account.",
  },
];