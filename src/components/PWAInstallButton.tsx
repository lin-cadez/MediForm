import { Download, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface PWAInstallButtonProps {
    compact?: boolean;
    className?: string;
}

export default function PWAInstallButton({ compact = false, className = "" }: PWAInstallButtonProps) {
    const navigate = useNavigate();
    const { canInstall, install, isInstalled, shouldShowInstallHelp } = usePwaInstall();

    if (isInstalled) return null;

    const handleClick = async () => {
        if (canInstall) {
            const result = await install();
            if (result.outcome !== "unavailable") return;
        }

        navigate("/download");
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className={`flex items-center gap-2 border-ocean-teal text-ocean-teal hover:bg-ocean-light bg-transparent ${className}`}
            title={shouldShowInstallHelp ? "Navodila za namestitev" : "Namesti aplikacijo"}
        >
            {shouldShowInstallHelp ? (
                <Smartphone className="h-4 w-4" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            <span className={compact ? "hidden sm:inline" : ""}>Namesti</span>
        </Button>
    );
}
