/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdvancedColorPicker from "@/components/ui/advanced-color-picker";
import { Trash2, Plus, Edit2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCategories } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    // Can optionally pass these if controlled from outside, or let it manage itself
    // For simplicity, let's make it more self-contained or use what we had
    habitColors?: string[];
}

const CategoryManagerDialog = ({ isOpen, onClose }: CategoryManagerDialogProps) => {
    const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [color, setColor] = useState("#3b82f6"); // Default Blue hex
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!name.trim()) return;

        try {
            if (editingId) {
                await updateCategory(editingId, name, color);
                toast({ title: "Category updated!" });
                setEditingId(null);
            } else {
                await addCategory(name, color);
                toast({ title: "Category added!" });
            }
            // Reset form
            setName("");
            setColor("#3b82f6");
        } catch (error) {
            toast({ title: "Operation failed", variant: "destructive" });
        }
    };

    const startEdit = (cat: any) => {
        setName(cat.name);
        setColor(cat.color); // Assuming cat.color is hex or compatible
        setEditingId(cat.id);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName("");
        setColor("#3b82f6");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            onClose(val);
            if (!val) cancelEdit();
        }}>
            <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Sector Management</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {editingId ? "Edit Sector Details" : "Create categories. Red is reserved."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Sector Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500/50"
                            />
                            {editingId && (
                                <Button variant="ghost" size="icon" onClick={cancelEdit} title="Cancel Edit">
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* RGB Circle Color Picker */}
                        <div className="flex justify-center py-4">
                            <AdvancedColorPicker
                                color={color}
                                onChange={setColor}
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            className={cn("w-full", editingId ? "bg-amber-600 hover:bg-amber-500" : "bg-indigo-600 hover:bg-indigo-500")}
                            disabled={!name.trim()}
                        >
                            {editingId ? <><Edit2 className="w-4 h-4 mr-2" /> Update Sector</> : <><Plus className="w-4 h-4 mr-2" /> Add Sector</>}
                        </Button>
                    </div>

                    <div className="text-xs text-zinc-500 uppercase tracking-widest pl-1 font-mono">Active Sectors</div>
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-2">
                            {categories.map((c) => (
                                <div
                                    key={c.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                        editingId === c.id ? "border-amber-500/50 bg-amber-500/10" : "border-white/5 bg-white/5 hover:bg-white/10"
                                    )}
                                    onClick={() => startEdit(c)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-colors"
                                            style={{ backgroundColor: c.color.startsWith('bg-') ? undefined : c.color }} /* Handle hex vs tailwind class if mixed data */
                                        // Note: We are moving to Hex. Existing 'bg-primary' might break style prop.
                                        // Fallback class if not hex?
                                        >
                                            {/* If it's a tailwind class, we need classname. If hex, style. */}
                                            {c.color.startsWith('bg-') && <div className={cn("w-full h-full rounded-full", c.color)} />}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-300">{c.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-900/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteCategory(c.id).catch(() => {
                                                toast({ title: "Failed to delete", variant: "destructive" });
                                            });
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryManagerDialog;
