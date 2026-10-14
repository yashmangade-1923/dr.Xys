import { Outlet } from "react-router-dom";
import VerticalNav from "../components/VerticalNav";
import Footer from "../components/Footer";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-skeuo-bg text-text-primary overflow-hidden">
            {/* Warm Sidebar */}
            <VerticalNav />

            {/* Main Content Area */}
            <div className="flex-grow ml-[80px] flex flex-col h-screen overflow-hidden">
                <main id="main-scroll-container" className="flex-grow overflow-y-auto w-full flex flex-col relative scroll-smooth">
                    <div className="flex-grow flex flex-col relative">
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
