"use client";

import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore, belongsToCurrentUser } from "@/store/useOrderStore";

export function useOrders(autoFetch = true) {
    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const { orders, total, loading, error, hasFetched, fetchOrders, resetOrders } =
        useOrderStore();

    useEffect(() => {
        if (!isHydrated) return;

        if (!isAuthenticated || !user) {
            resetOrders();
            return;
        }

        if (autoFetch && !hasFetched) {
            void fetchOrders();
        }
    }, [isHydrated, isAuthenticated, user, autoFetch, hasFetched, fetchOrders, resetOrders]);

    const userOrders = useMemo(() => {
        const list = Array.isArray(orders) ? orders : [];
        return list.filter((order) => belongsToCurrentUser(order, user?.id, user?.email));
    }, [orders, user?.id, user?.email]);

    const ordersCount = userOrders.length > 0 ? userOrders.length : total;

    return {
        orders: userOrders,
        ordersCount,
        loading,
        error,
        refetch: () => fetchOrders({ force: true }),
    };
}