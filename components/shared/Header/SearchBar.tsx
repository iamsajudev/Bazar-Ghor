"use client";

import { SearchSuggestions } from "./SearchSuggestions";

export const SearchBar = ({ isMobile = false }: { isMobile?: boolean }) => {
    return (
        <div className={`w-full ${isMobile ? "" : "max-w-2xl mx-auto"}`}>
            <SearchSuggestions />
        </div>
    );
};