// data/preOrderInfo.ts

export interface PreOrderStep {
    step: string;
    title: string;
    description: string;
}

export interface PreOrderPolicyCard {
    id: string;
    title: string;
    summary: string;
    points: string[];
}

export interface PreOrderFaqItem {
    question: string;
    answer: string;
}

export const PRE_ORDER_META = {
    badge: "Pre-Order Guide & Policy",
    title: "Pre-Order Information",
    subtitle:
        "Reserve upcoming batches, seasonal harvests, and limited-edition releases ahead of arrival—with transparent timelines and full buyer protection.",
    highlights: [
        { label: "Batch Reservation", value: "Priority Allocation" },
        { label: "Estimated Dispatch", value: "7 – 21 Business Days" },
        { label: "Price Protection", value: "Locked at Order" },
        { label: "Cancellation", value: "Before Dispatch" },
    ],
};

export const PRE_ORDER_STEPS: PreOrderStep[] = [
    {
        step: "01",
        title: "Select a Pre-Order Item",
        description:
            "Choose an item marked as Pre-Order along with your preferred variant, quantity, and estimated arrival window.",
    },
    {
        step: "02",
        title: "Confirm & Lock Your Slot",
        description:
            "Complete checkout to reserve your unit from the incoming batch. Your order price is locked once placed.",
    },
    {
        step: "03",
        title: "Batch Arrival & Quality Check",
        description:
            "Once the shipment or fresh batch arrives, each item goes through standard inspection and careful packaging.",
    },
    {
        step: "04",
        title: "Dispatch & Tracking",
        description:
            "Your order is handed over to our delivery partner and you receive tracking updates until delivery.",
    },
];

export const PRE_ORDER_POLICY_CARDS: PreOrderPolicyCard[] = [
    {
        id: "timelines",
        title: "Estimated Delivery Timelines",
        summary:
            "Pre-order dates are estimates based on supplier schedules, seasonal readiness, and transit.",
        points: [
            "Typical arrival windows range from 7 to 21 business days depending on the product batch.",
            "If a batch schedule shifts, we notify customers promptly with updated expectations.",
            "Orders containing both ready-stock and pre-order items may ship together or in batches based on availability.",
        ],
    },
    {
        id: "pricing-payment",
        title: "Pricing & Payment Terms",
        summary:
            "Clear upfront pricing with no surprise post-order markups on reserved items.",
        points: [
            "The unit price shown at checkout is locked for your confirmed pre-order slot.",
            "Applicable shipping fees and promotional discounts are calculated at checkout.",
            "Online or confirmed reservations follow our standard order and payment verification steps.",
        ],
    },
    {
        id: "changes-cancellation",
        title: "Modifications & Cancellations",
        summary:
            "Flexible changes before your order enters final packing and courier dispatch.",
        points: [
            "You can request an address update or cancellation before the order is dispatched.",
            "Once an item is packed or handed over to the courier, standard return or cancellation rules apply.",
            "Eligible refunds are processed back to the original payment channel according to our Refund Policy.",
        ],
    },
];

export const PRE_ORDER_FAQS: PreOrderFaqItem[] = [
    {
        question: "Why do certain products open for pre-order?",
        answer:
            "Pre-orders allow us to reserve fresh batches, imported shipments, or limited production runs for customers who want guaranteed availability as soon as stock arrives.",
    },
    {
        question: "Is the delivery date on a pre-order guaranteed to the exact day?",
        answer:
            "Displayed dates are estimated dispatch windows. While we aim to ship right on schedule, supplier lead times, weather, or customs/logistics delays can occasionally shift arrival by a few days.",
    },
    {
        question: "Can I cancel my pre-order if I no longer need it?",
        answer:
            "Yes, pre-orders can generally be canceled free of charge prior to dispatch. Please reach out to our support team with your order number as early as possible.",
    },
    {
        question: "What happens if I add a regular in-stock item with a pre-order item?",
        answer:
            "To avoid extra shipping friction, we either coordinate dispatch once items are ready or follow the selected shipping option shown during checkout.",
    },
];