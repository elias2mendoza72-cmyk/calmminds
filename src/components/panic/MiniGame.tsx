import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw, Sparkles } from "lucide-react";

interface Tile {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ["🌸", "🌊", "🌿", "🦋", "🌙", "⭐", "🌈", "🕊️"];

export default function MiniGame() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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

    const newTiles = [...tiles];
    newTiles[id].isFlipped = true;
    setTiles(newTiles);

    const newFlipped = [...flippedTiles, id];
    setFlippedTiles(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;
      
      if (tiles[first].emoji === tiles[second].emoji) {
        // Match found
        setTimeout(() => {
          const matchedTiles = [...tiles];
          matchedTiles[first].isMatched = true;
          matchedTiles[second].isMatched = true;
          setTiles(matchedTiles);
          setMatchedPairs((prev) => {
            const newPairs = prev + 1;
            if (newPairs === EMOJIS.length) {
              setIsComplete(true);
            }
            return newPairs;
          });
          setFlippedTiles([]);
        }, 500);
      } else {
        // No match
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

  const progress = (matchedPairs / EMOJIS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-semibold mb-2">Memory Match</h2>
        <p className="text-panic-text/70 text-sm">
          Focus on finding pairs to calm your mind
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-panic-text/70">Pairs found: {matchedPairs}/{EMOJIS.length}</span>
          <span className="text-panic-text/70">Moves: {moves}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {isComplete ? (
        <Card className="bg-panic-accent/20 border-panic-accent/30">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-panic-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">Well Done!</h3>
            <p className="text-panic-text/70 mb-4">
              You completed the game in {moves} moves
            </p>
            <Button onClick={initializeGame} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              disabled={tile.isFlipped || tile.isMatched}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 transform ${
                tile.isFlipped || tile.isMatched
                  ? "bg-panic-accent/30 scale-100"
                  : "bg-panic-accent/10 hover:bg-panic-accent/20 hover:scale-105"
              } ${tile.isMatched ? "opacity-60" : ""}`}
            >
              {tile.isFlipped || tile.isMatched ? (
                <span className="animate-scale-in">{tile.emoji}</span>
              ) : (
                <Sparkles className="w-5 h-5 text-panic-accent/50" />
              )}
            </button>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={initializeGame}
        className="w-full gap-2 border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
      >
        <RotateCcw className="w-4 h-4" />
        Restart Game
      </Button>
    </div>
  );
}
