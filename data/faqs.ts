export interface FAQItem {
    q: string;
    a: string;
}

export interface FAQCategory {
    category: string;
    questions: FAQItem[];
}

export const FAQ_DATA: FAQCategory[] = [
    {
        category: "Orders & Delivery",
        questions: [
            {
                q: "How long does delivery take?",
                a: "Inside Dhaka, delivery usually takes 24-48 hours. Outside Dhaka, it takes 3-5 business days.",
            },
            {
                q: "What are the delivery charges?",
                a: "Delivery charge inside Dhaka is ৳60, and outside Dhaka is ৳120. However, delivery is free on orders over ৳1000.",
            },
            {
                q: "Can I track my order?",
                a: "Yes, you can track your order by clicking on 'Track Order' in the top header or visiting the order tracking page with your order ID.",
            },
            {
                q: "Do you offer Cash on Delivery (COD)?",
                a: "Yes, we offer Cash on Delivery for most products. However, some special items like mangoes may require advance payment.",
            },
            {
                q: "Can I change my delivery address after placing an order?",
                a: "You can change the delivery address before the order is dispatched. Please contact our support team immediately.",
            },
        ],
    },
    {
        category: "Returns & Refunds",
        questions: [
            {
                q: "What is your return policy?",
                a: "We offer a 30-day return policy for most products. The item must be unused and in its original packaging.",
            },
            {
                q: "How do I request a refund?",
                a: "You can request a refund by contacting our support team via phone or email. Refunds are processed within 7-10 business days.",
            },
            {
                q: "Can I exchange a product?",
                a: "Yes, you can exchange a product within 7 days of delivery, provided it is unused and in original condition.",
            },
            {
                q: "What if I receive a damaged product?",
                a: "Please contact us immediately with photos of the damaged product. We will arrange a replacement or refund.",
            },
        ],
    },
    {
        category: "Products & Quality",
        questions: [
            {
                q: "Are your products 100% organic?",
                a: "Yes, we source our products directly from trusted local farmers and ensure they are free from chemicals and preservatives.",
            },
            {
                q: "How do I know if a product is in stock?",
                a: "The product page shows real-time stock availability. If a product is out of stock, you can sign up for a notification.",
            },
            {
                q: "Do you offer wholesale prices?",
                a: "Yes, we offer special pricing for bulk orders. Please contact our sales team for more information.",
            },
            {
                q: "How should I store the products?",
                a: "Storage instructions are mentioned on each product page. Most items should be kept in a cool, dry place.",
            },
        ],
    },
    {
        category: "Account & Payment",
        questions: [
            {
                q: "How do I create an account?",
                a: "Click on 'Sign In' in the header, then click 'Create Account'. Fill in your details and you're ready to shop!",
            },
            {
                q: "What payment methods do you accept?",
                a: "We accept Cash on Delivery, bKash, Nagad, and major credit/debit cards (Visa, Mastercard, Amex).",
            },
            {
                q: "Is my payment information secure?",
                a: "Yes, we use SSL encryption to protect your payment information. We never store your card details on our servers.",
            },
            {
                q: "How do I reset my password?",
                a: "Click on 'Forgot Password' on the login page, enter your email, and we'll send you a reset link.",
            },
        ],
    },
];