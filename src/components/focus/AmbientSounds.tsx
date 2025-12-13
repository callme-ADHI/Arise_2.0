import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, CloudRain, Wind, Coffee, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const sounds = [
  { id: "rain", name: "Rain", icon: CloudRain },
  { id: "wind", name: "White Noise", icon: Wind },
  { id: "cafe", name: "Café", icon: Coffee },
  { id: "waves", name: "Waves", icon: Waves },
];

const AmbientSounds = () => {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = (soundId: string) => {
    setActiveSound(activeSound === soundId ? null : soundId);
  };

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Ambient Sounds</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {sounds.map((sound) => (
            <Button
              key={sound.id}
              variant={activeSound === sound.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex flex-col h-auto py-3 gap-1",
                activeSound === sound.id && "glow-sm"
              )}
              onClick={() => toggleSound(sound.id)}
            >
              <sound.icon className="w-5 h-5" />
              <span className="text-xs">{sound.name}</span>
            </Button>
          ))}
        </div>

        {activeSound && (
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmbientSounds;
