import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw, Sparkles } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface Tile {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ["🌸", "🌊", "🌿", "🦋", "🌙", "⭐", "🌈", "🕊️"];

export default function MemoryMatchGame() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { playClickSound, playSuccessSound, playCompletionSound } = useSound();

  const initializeGame = useCallback(() => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setTiles(shuffledEmojis);
    setFlippedTiles([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleTileClick = (id: number) => {
    if (flippedTiles.length === 2) return;
    if (tiles[id].isFlipped || tiles[id].isMatched) return;

    playClickSound();
    
    const newTiles = [...tiles];
    newTiles[id].isFlipped = true;
    setTiles(newTiles);

    const newFlipped = [...flippedTiles, id];
    setFlippedTiles(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;
      
      if (tiles[first].emoji === tiles[second].emoji) {
        setTimeout(() => {
          playSuccessSound();
          const matchedTiles = [...tiles];
          matchedTiles[first].isMatched = true;
          matchedTiles[second].isMatched = true;
          setTiles(matchedTiles);
          setMatchedPairs((prev) => {
            const newPairs = prev + 1;
            if (newPairs === EMOJIS.length) {
              setIsComplete(true);
              setTimeout(() => playCompletionSound(), 300);
            }
            return newPairs;
          });
          setFlippedTiles([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetTiles = [...tiles];
          resetTiles[first].isFlipped = false;
          resetTiles[second].isFlipped = false;
          setTiles(resetTiles);
          setFlippedTiles([]);
        }, 1000);
      }
    }
  };

  const progressPercent = (matchedPairs / EMOJIS.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-muted-foreground text-sm">Pairs: {matchedPairs}/{EMOJIS.length}</span>
          <p className="text-2xl font-bold text-primary">{moves} moves</p>
        </div>
        <Button variant="outline" size="sm" onClick={initializeGame}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Restart
        </Button>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {isComplete ? (
        <div className="p-8 text-center rounded-xl bg-primary/10 border border-primary/20">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Well Done!</h3>
          <p className="text-muted-foreground mb-4">
            Completed in {moves} moves
          </p>
          <Button onClick={initializeGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              disabled={tile.isFlipped || tile.isMatched}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 transform border ${
                tile.isFlipped || tile.isMatched
                  ? "bg-primary/20 border-primary/30 scale-100"
                  : "bg-secondary/50 border-border/50 hover:bg-secondary hover:scale-105"
              } ${tile.isMatched ? "opacity-60" : ""}`}
            >
              {tile.isFlipped || tile.isMatched ? (
                <span className="animate-scale-in">{tile.emoji}</span>
              ) : (
                <Sparkles className="w-5 h-5 text-muted-foreground/50" />
              )}
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-muted-foreground text-sm">
        Find matching pairs to clear the board 🧠
      </p>
    </div>
  );
}
