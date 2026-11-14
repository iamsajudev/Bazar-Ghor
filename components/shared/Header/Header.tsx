import { TopHeader } from "./TopHeader";
import { CenterHeader } from "./CenterHeader";
import { BottomHeader } from "./BottomHeader";

export const Header = () => {
    return (
        <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
            <TopHeader />
            <CenterHeader />
            <BottomHeader />
        </header>
    );
};