import { useState } from "react";
import { Plus, Search, BookOpen, Trash2, Edit2, X, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useJournal } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { JournalEntry } from "@/lib/types";

const moodEmojis = ["", "😔", "😐", "🙂", "😊", "🤩"];
const prompts = [
  "What are you grateful for today?",
  "What challenged you today and how did you handle it?",
  "What's one thing you learned today?",
  "How are you feeling right now and why?",
  "What's one goal you want to focus on tomorrow?",
];

const Journal = () => {
  const { entries, addEntry, updateEntry, deleteEntry } = useJournal();
  const { toast } = useToast();
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEntry, setNewEntry] = useState({ title: "", content: "", mood: 3, tags: [] as string[] });
  const [tagInput, setTagInput] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);

  const handleSave = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) { toast({ title: "Title and content required", variant: "destructive" }); return; }
    addEntry({ ...newEntry, sentiment: newEntry.mood >= 4 ? 'positive' : newEntry.mood >= 3 ? 'neutral' : 'negative' });
    toast({ title: "Entry saved! +15 XP" });
    setNewEntry({ title: "", content: "", mood: 3, tags: [] });
    setIsWriting(false);
  };

  const handleUpdate = () => {
    if (!editingEntry) return;
    updateEntry(editingEntry);
    toast({ title: "Entry updated!" });
    setEditingEntry(null);
  };

  const addTag = (entry: typeof newEntry, setEntry: (e: typeof newEntry) => void) => {
    if (tagInput && !entry.tags.includes(tagInput)) {
      setEntry({ ...entry, tags: [...entry.tags, tagInput.toLowerCase()] });
      setTagInput("");
    }
  };

  const shufflePrompt = () => {
    const newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(newPrompt);
    setNewEntry({ ...newEntry, content: newPrompt + "\n\n" });
  };

  const filteredEntries = entries.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    new Date(e.createdAt).toLocaleDateString().includes(searchQuery)
  );

  const analyzeMood = (text: string) => {
    const lower = text.toLowerCase();
    const keywords = {
      1: ['terrible', 'horrible', 'worst', 'hate', 'depressed', 'sad', 'awful', 'pain', 'cry', 'failed', 'bad day'],
      2: ['bad', 'tired', 'annoyed', 'hard', 'difficult', 'struggling', 'stress', 'anxious', 'boring', 'lonely'],
      4: ['good', 'happy', 'nice', 'better', 'productive', 'fun', 'enjoyed', 'liked', 'cool', 'calm'],
      5: ['amazing', 'great', 'awesome', 'best', 'love', 'excited', 'fantastic', 'wonderful', 'perfect', 'grateful']
    };

    let score = 3; // Start Neutral
    let matches = { 1: 0, 2: 0, 4: 0, 5: 0 };

    // Simple frequency count
    Object.entries(keywords).forEach(([level, words]) => {
      words.forEach(word => {
        if (lower.includes(word)) matches[level as any] = (matches[level as any] || 0) + 1;
      });
    });

    // Determine winner
    if (matches[5] > 0 && matches[5] >= matches[1] && matches[5] >= matches[2]) score = 5;
    else if (matches[1] > 0 && matches[1] >= matches[5] && matches[1] >= matches[4]) score = 1;
    else if (matches[4] > matches[2]) score = 4;
    else if (matches[2] > matches[4]) score = 2;

    return score;
  };

  // Auto-analyze mood when content changes significantly (simple version)
  const handleContentChange = (content: string) => {
    setNewEntry(prev => {
      // Only auto-update if content length > 10 to avoid noise
      if (content.length > 10) {
        const suggestedMood = analyzeMood(content);
        return { ...prev, content, mood: suggestedMood };
      }
      return { ...prev, content };
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-accent" />Journal</h1><p className="text-muted-foreground text-sm">{entries.length} entries</p></div>
        <Button onClick={() => setIsWriting(true)} size="sm"><Plus className="w-4 h-4 mr-2" />New</Button>
      </div>

      {isWriting && (
        <Card className="glass animate-scale-in">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">New Entry</CardTitle>
            <Button variant="ghost" size="sm" onClick={shufflePrompt}><Sparkles className="w-4 h-4 mr-1" />Prompt</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 justify-center">{[1, 2, 3, 4, 5].map((m) => (<Button key={m} variant={newEntry.mood === m ? "default" : "outline"} size="sm" onClick={() => setNewEntry({ ...newEntry, mood: m })}>{moodEmojis[m]}</Button>))}</div>
            <Input placeholder="Entry title" value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} />
            <Textarea
              placeholder="Write your thoughts..."
              value={newEntry.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="flex gap-2"><Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newEntry, setNewEntry))} /><Button variant="outline" onClick={() => addTag(newEntry, setNewEntry)}>Add</Button></div>
            {newEntry.tags.length > 0 && <div className="flex flex-wrap gap-1">{newEntry.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary cursor-pointer" onClick={() => setNewEntry({ ...newEntry, tags: newEntry.tags.filter(t => t !== tag) })}>#{tag} ×</span>))}</div>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setIsWriting(false)}>Cancel</Button><Button className="flex-1" onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button></div>
          </CardContent>
        </Card>
      )}

      {editingEntry && (
        <Card className="glass animate-scale-in border-primary">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Edit Entry</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditingEntry(null)}><X className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 justify-center">{[1, 2, 3, 4, 5].map((m) => (<Button key={m} variant={editingEntry.mood === m ? "default" : "outline"} size="sm" onClick={() => setEditingEntry({ ...editingEntry, mood: m })}>{moodEmojis[m]}</Button>))}</div>
            <Input value={editingEntry.title} onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })} />
            <Textarea value={editingEntry.content} onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })} className="min-h-[150px]" />
            <div className="flex gap-2">
              <Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && tagInput && !editingEntry.tags.includes(tagInput)) { e.preventDefault(); setEditingEntry({ ...editingEntry, tags: [...editingEntry.tags, tagInput.toLowerCase()] }); setTagInput(""); } }} />
              <Button variant="outline" onClick={() => { if (tagInput && !editingEntry.tags.includes(tagInput)) { setEditingEntry({ ...editingEntry, tags: [...editingEntry.tags, tagInput.toLowerCase()] }); setTagInput(""); } }}>Add</Button>
            </div>
            {editingEntry.tags.length > 0 && <div className="flex flex-wrap gap-1">{editingEntry.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary cursor-pointer" onClick={() => setEditingEntry({ ...editingEntry, tags: editingEntry.tags.filter(t => t !== tag) })}>#{tag} ×</span>))}</div>}
            <Button className="w-full" onClick={handleUpdate}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
          </CardContent>
        </Card>
      )}

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <div className="space-y-3">
        {filteredEntries.length === 0 ? <p className="text-center text-muted-foreground py-8">No entries yet. Start writing!</p> : filteredEntries.map((entry) => (
          <Card key={entry.id} className="glass group">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{moodEmojis[entry.mood]}</span><h3 className="font-medium">{entry.title}</h3></div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    {entry.updatedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
                    {entry.tags.map((tag) => (<span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary">#{tag}</span>))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => setEditingEntry(entry)}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => deleteEntry(entry.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Journal;
