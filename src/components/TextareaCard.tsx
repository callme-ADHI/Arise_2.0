import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

export const TextareaCard = () => {
    const [note, setNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const savedNote = localStorage.getItem("dailyNote");
        if (savedNote) {
            setNote(savedNote);
        }
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network delay for better UX feel
        setTimeout(() => {
            localStorage.setItem("dailyNote", note);
            setIsSaving(false);
            toast({ title: "Note saved!", description: "Your daily note has been updated." });
        }, 500);
    };

    return (
        <div className="space-y-4">
            <Textarea
                placeholder="Type your daily thoughts, intentions, or quick notes here..."
                className="min-h-[120px] bg-secondary/20 resize-none focus-visible:ring-primary"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end">
                <Button size="sm" onClick={handleSave} disabled={isSaving || !note.trim()}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Note
                </Button>
            </div>
        </div>
    );
};
