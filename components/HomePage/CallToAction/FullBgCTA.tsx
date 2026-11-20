"use client";

export const FullBgCTA = () => {
    return (
        <section
            className="relative w-full py-24 md:py-52 bg-cover bg-center bg-no-repeat rounded-3xl overflow-hidden mb-15"
            style={{ backgroundImage: "url('./images/call-to-action-2.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/10" />
        </section>
    );
};