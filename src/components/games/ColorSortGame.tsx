import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const GRADIENTS = [
  { 
    name: "Sunset", 
    colors: ["#FF6B6B", "#FF8E53", "#FEC89A", "#FFD93D"],
    description: "Arrange from deep red to bright yellow"
  },
  { 
    name: "Ocean", 
    colors: ["#0077B6", "#00B4D8", "#48CAE4", "#90E0EF"],
    description: "Dark blue to light aqua"
  },
  { 
    name: "Forest", 
    colors: ["#1B4332", "#2D6A4F", "#40916C", "#74C69D"],
    description: "Deep green to mint"
  },
  { 
    name: "Lavender", 
    colors: ["#5A189A", "#7B2CBF", "#9D4EDD", "#C77DFF"],
    description: "Rich purple to soft violet"
  },
  { 
    name: "Ember", 
    colors: ["#6A040F", "#9D0208", "#DC2F02", "#F48C06"],
    description: "Deep crimson to bright orange"
  },
];

interface ColorTile {
  id: number;
  color: string;
  correctIndex: number;
}

export default function ColorSortGame() {
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [tiles, setTiles] = useState<ColorTile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  const initializeGame = () => {
    const newGradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    setGradient(newGradient);
    
    // Create tiles with correct indices
    const newTiles: ColorTile[] = newGradient.colors.map((color, index) => ({
      id: index,
      color,
      correctIndex: index,
    }));

    // Shuffle tiles
    const shuffled = [...newTiles].sort(() => Math.random() - 0.5);
    
    // Make sure it's not already solved
    while (shuffled.every((tile, idx) => tile.correctIndex === idx)) {
      shuffled.sort(() => Math.random() - 0.5);
    }

    setTiles(shuffled);
    setSelectedIndex(null);
    setMoves(0);
    setIsSolved(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      // Swap tiles
      const newTiles = [...tiles];
      [newTiles[selectedIndex], newTiles[index]] = [newTiles[index], newTiles[selectedIndex]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      setSelectedIndex(null);

      // Check if solved
      const solved = newTiles.every((tile, idx) => tile.correctIndex === idx);
      if (solved) {
        setIsSolved(true);
        toast.success("Perfect gradient! 🎨");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-muted-foreground text-sm">{gradient.name}</span>
          <p className="text-2xl font-bold text-primary">{moves} moves</p>
        </div>
        <Button variant="outline" size="sm" onClick={initializeGame}>
          <RefreshCw className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>

      {/* Goal preview */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Goal:</span>
          <ArrowRight className="w-3 h-3" />
          <span>{gradient.description}</span>
        </div>
        <div className="flex gap-1">
          {gradient.colors.map((color, i) => (
            <div
              key={i}
              className="h-4 flex-1 rounded-sm first:rounded-l-md last:rounded-r-md"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Game grid */}
      <div className="flex gap-2 justify-center py-4">
        {tiles.map((tile, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = tile.correctIndex === index;
          
          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(index)}
              className={`w-16 h-20 md:w-20 md:h-24 rounded-xl transition-all duration-200 relative border-2 ${
                isSelected 
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-95 border-foreground" 
                  : "hover:scale-105 border-transparent"
              } ${isSolved ? "cursor-default" : "cursor-pointer"}`}
              style={{ backgroundColor: tile.color }}
            >
              {isCorrect && isSolved && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono">
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {isSolved && (
        <div className="text-center py-4 animate-fade-in">
          <p className="text-lg font-semibold text-primary mb-2">
            ✨ Beautiful Gradient! ✨
          </p>
          <Button onClick={initializeGame}>
            Try Another
          </Button>
        </div>
      )}

      <p className="text-center text-muted-foreground text-sm">
        Tap two colors to swap and create the gradient 🎨
      </p>
    </div>
  );
}
