import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Phone, AlertTriangle } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1 w-full relative">
                    <div className="absolute top-4 left-4 z-50 md:hidden">
                        <SidebarTrigger />
                    </div>
                    <Outlet />

                    {/* Emergency SOS Button */}
                    <div className="fixed bottom-6 right-6 z-50">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="bg-destructive hover:bg-destructive/90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-pulse hover:animate-none ring-4 ring-destructive/30"
                                >
                                    <span className="font-bold font-display tracking-widest text-xs">SOS</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 border-destructive/50 bg-destructive/5 shadow-2xl">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-destructive">
                                        <AlertTriangle className="w-6 h-6" />
                                        <h3 className="font-bold text-lg">Emergency Assistance</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-destructive/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Local Police</p>
                                                    <p className="text-xs text-muted-foreground">Emergency</p>
                                                </div>
                                            </div>
                                            <a href="tel:112" className="text-lg font-bold text-destructive hover:underline">112</a>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-destructive/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Ambulance</p>
                                                    <p className="text-xs text-muted-foreground">Medical</p>
                                                </div>
                                            </div>
                                            <a href="tel:112" className="text-lg font-bold text-destructive hover:underline">112</a>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-background rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Your Current Location</p>
                                        <p className="font-mono text-sm">48.8566° N, 2.3522° E</p>
                                        <p className="text-xs text-muted-foreground mt-1">Paris, France (Accuracy: High)</p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Toaster />
                </main>
            </div>
        </SidebarProvider>
    );
}
