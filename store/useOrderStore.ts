"use client";

import { CustomerOrder } from "@/components/Account/Order/OrderCard";
import { create } from "zustand";

interface OrdersApiResponse {
    data?: CustomerOrder[] | { data?: CustomerOrder[] };
    orders?: CustomerOrder[];
    meta?: { total?: number };
}

interface OrderStoreState {
    orders: CustomerOrder[];
    total: number;
    loading: boolean;
    error: string | null;
    hasFetched: boolean;
    fetchOrders: (options?: { force?: boolean }) => Promise<void>;
    resetOrders: () => void;
}

let inflightPromise: Promise<void> | null = null;

function extractOrdersList(payload: OrdersApiResponse | null | undefined): {
    list: CustomerOrder[];
    total: number;
} {
    if (!payload) return { list: [], total: 0 };

    if (Array.isArray(payload.data)) {
        return {
            list: payload.data,
            total: typeof payload.meta?.total === "number" ? payload.meta.total : payload.data.length,
        };
    }

    if (payload.data && !Array.isArray(payload.data) && Array.isArray(payload.data.data)) {
        return {
            list: payload.data.data,
            total:
                typeof payload.meta?.total === "number"
                    ? payload.meta.total
                    : payload.data.data.length,
        };
    }

    if (Array.isArray(payload.orders)) {
        return {
            list: payload.orders,
            total:
                typeof payload.meta?.total === "number" ? payload.meta.total : payload.orders.length,
        };
    }

    return { list: [], total: 0 };
}

export function belongsToCurrentUser(
    order: CustomerOrder,
    userId?: number | string,
    userEmail?: string
): boolean {
    const normalizedEmail = userEmail?.trim().toLowerCase();
    const orderEmail = (order.email ?? order.guest_email ?? order.customer_email)
        ?.trim()
        .toLowerCase();

    if (normalizedEmail && orderEmail) {
        return orderEmail === normalizedEmail;
    }

    const orderOwnerId = order.user_id ?? order.customer_id;
    if (userId !== undefined && orderOwnerId !== undefined) {
        return String(orderOwnerId) === String(userId);
    }

    return true;
}

export const useOrderStore = create<OrderStoreState>((set, get) => ({
    orders: [],
    total: 0,
    loading: false,
    error: null,
    hasFetched: false,

    fetchOrders: async (options) => {
        const force = Boolean(options?.force);
        const { hasFetched } = get();

        if (hasFetched && !force) {
            return;
        }

        if (inflightPromise && !force) {
            return inflightPromise;
        }

        set({ loading: true, error: null });

        const runRequest = async () => {
            try {
                const res = await fetch("/api/orders", { cache: "no-store" });
                const body = (await res.json().catch(() => ({}))) as OrdersApiResponse & {
                    message?: string;
                };

                if (!res.ok) {
                    throw new Error(body?.message || `Failed to load orders (${res.status})`);
                }

                const { list, total } = extractOrdersList(body);
                set({
                    orders: Array.isArray(list) ? list : [],
                    total,
                    loading: false,
                    error: null,
                    hasFetched: true,
                });
            } catch (err: unknown) {
                set({
                    orders: [],
                    total: 0,
                    loading: false,
                    error: err instanceof Error ? err.message : "Failed to load orders",
                    hasFetched: true,
                });
            } finally {
                inflightPromise = null;
            }
        };

        inflightPromise = runRequest();
        return inflightPromise;
    },

    resetOrders: () => {
        inflightPromise = null;
        set({
            orders: [],
            total: 0,
            loading: false,
            error: null,
            hasFetched: false,
        });
    },
}));