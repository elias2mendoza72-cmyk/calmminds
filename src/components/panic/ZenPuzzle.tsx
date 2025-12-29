import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

const PATTERNS = [
  { name: "Sunset", colors: ["#FF6B6B", "#FEC89A", "#FFD93D", "#FF8E53"] },
  { name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { name: "Forest", colors: ["#2D6A4F", "#40916C", "#74C69D", "#B7E4C7"] },
  { name: "Night", colors: ["#1A1A2E", "#16213E", "#0F3460", "#533483"] },
  { name: "Spring", colors: ["#FF99C8", "#FCF6BD", "#D0F4DE", "#A9DEF9"] },
];

interface Tile {
  id: number;
  color: string;
  currentPos: number;
  correctPos: number;
}

export default function ZenPuzzle() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [gridSize, setGridSize] = useState(3);

  const initializePuzzle = () => {
    const newPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    setPattern(newPattern);
    
    const totalTiles = gridSize * gridSize;
    const colorsPerTile = Math.ceil(totalTiles / newPattern.colors.length);
    
    const tileColors: string[] = [];
    newPattern.colors.forEach(color => {
      for (let i = 0; i < colorsPerTile && tileColors.length < totalTiles; i++) {
        tileColors.push(color);
      }
    });

    // Create tiles with correct positions
    const newTiles: Tile[] = tileColors.map((color, index) => ({
      id: index,
      color,
      currentPos: index,
      correctPos: index,
    }));

    // Shuffle positions
    const positions = [...Array(totalTiles).keys()];
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    newTiles.forEach((tile, index) => {
      tile.currentPos = positions[index];
    });

    setTiles(newTiles);
    setSelectedTile(null);
    setMoves(0);
    setIsSolved(false);
  };

  useEffect(() => {
    initializePuzzle();
  }, [gridSize]);

  const handleTileClick = (tileId: number) => {
    if (isSolved) return;

    if (selectedTile === null) {
      setSelectedTile(tileId);
    } else if (selectedTile === tileId) {
      setSelectedTile(null);
    } else {
      // Swap tiles
      setTiles(prev => {
        const newTiles = [...prev];
        const tile1 = newTiles.find(t => t.id === selectedTile)!;
        const tile2 = newTiles.find(t => t.id === tileId)!;
        const tempPos = tile1.currentPos;
        tile1.currentPos = tile2.currentPos;
        tile2.currentPos = tempPos;
        return newTiles;
      });
      setMoves(m => m + 1);
      setSelectedTile(null);
    }
  };

  useEffect(() => {
    if (tiles.length > 0) {
      const solved = tiles.every(t => t.currentPos === t.correctPos);
      if (solved && !isSolved && moves > 0) {
        setIsSolved(true);
        toast.success("Beautiful! You completed the pattern! 🎨");
      }
    }
  }, [tiles, isSolved, moves]);

  const getTileAtPosition = (pos: number) => {
    return tiles.find(t => t.currentPos === pos);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-panic-accent/10 border-panic-accent/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-panic-text/60 text-sm">{pattern.name} Pattern</span>
              <p className="text-lg font-display font-semibold text-panic-text">
                Moves: {moves}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="bg-panic-bg/50 border border-panic-accent/30 rounded-lg px-2 py-1 text-sm text-panic-text"
              >
                <option value={3}>3×3</option>
                <option value={4}>4×4</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={initializePuzzle}
                className="border-panic-accent/30 text-panic-accent hover:bg-panic-accent/20"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-3">
            <span className="text-xs text-panic-text/50">Goal pattern:</span>
            <div className="flex gap-1 mt-1">
              {pattern.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Puzzle Grid */}
          <div
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              maxWidth: 280,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, pos) => {
              const tile = getTileAtPosition(pos);
              if (!tile) return null;
              
              const isSelected = selectedTile === tile.id;
              const isCorrect = tile.currentPos === tile.correctPos;
              
              return (
                <button
                  key={pos}
                  onClick={() => handleTileClick(tile.id)}
                  className={`aspect-square rounded-lg transition-all duration-200 relative
                    ${isSelected ? "ring-2 ring-white scale-95" : "hover:scale-105"}
                    ${isSolved ? "cursor-default" : "cursor-pointer"}`}
                  style={{ backgroundColor: tile.color }}
                >
                  {isCorrect && isSolved && (
                    <Check className="absolute inset-0 m-auto w-6 h-6 text-white/80" />
                  )}
                </button>
              );
            })}
          </div>

          {isSolved && (
            <div className="text-center mt-4 animate-fade-in">
              <p className="text-panic-accent font-display font-semibold">
                ✨ Perfect! Pattern Complete ✨
              </p>
              <Button
                onClick={initializePuzzle}
                className="mt-2 bg-panic-accent hover:bg-panic-accent/80"
              >
                Try Another
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-panic-text/60 text-sm">
        Tap two tiles to swap them and create the gradient pattern
      </p>
    </div>
  );
}
