import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Palette } from "lucide-react";

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8B500", "#FF69B4", "#00CED1", "#FFA07A", "#98FB98",
];

const PATTERNS = [
  {
    id: "mandala",
    name: "Mandala",
    paths: [
      "M200,50 Q250,100 200,150 Q150,100 200,50",
      "M200,50 Q300,100 200,150 Q100,100 200,50",
      "M200,50 L250,150 L150,150 Z",
      "M200,150 Q250,200 200,250 Q150,200 200,150",
      "M200,150 Q300,200 200,250 Q100,200 200,150",
      "M50,200 Q100,250 150,200 Q100,150 50,200",
      "M350,200 Q300,250 250,200 Q300,150 350,200",
      "M200,250 Q250,300 200,350 Q150,300 200,250",
    ],
  },
  {
    id: "flower",
    name: "Flower",
    paths: [
      "M200,100 Q250,50 300,100 Q250,150 200,100",
      "M200,100 Q150,50 100,100 Q150,150 200,100",
      "M200,100 Q250,150 200,200 Q150,150 200,100",
      "M200,100 Q150,150 200,200 Q250,150 200,100",
      "M200,200 Q200,250 200,300",
      "M200,260 Q150,240 120,260",
      "M200,260 Q250,240 280,260",
      "M170,140 A30,30 0 1,1 230,140 A30,30 0 1,1 170,140",
    ],
  },
  {
    id: "butterfly",
    name: "Butterfly",
    paths: [
      "M200,150 Q100,50 50,150 Q100,250 200,150",
      "M200,150 Q300,50 350,150 Q300,250 200,150",
      "M200,150 Q120,100 80,130 Q120,160 200,150",
      "M200,150 Q280,100 320,130 Q280,160 200,150",
      "M200,150 L200,300",
      "M200,180 Q170,200 160,220",
      "M200,180 Q230,200 240,220",
    ],
  },
  {
    id: "heart",
    name: "Hearts",
    paths: [
      "M200,120 Q200,80 170,80 Q130,80 130,130 Q130,180 200,230 Q270,180 270,130 Q270,80 230,80 Q200,80 200,120",
      "M100,200 Q100,170 80,170 Q55,170 55,200 Q55,230 100,260 Q145,230 145,200 Q145,170 120,170 Q100,170 100,200",
      "M300,200 Q300,170 280,170 Q255,170 255,200 Q255,230 300,260 Q345,230 345,200 Q345,170 320,170 Q300,170 300,200",
      "M200,280 Q200,260 185,260 Q165,260 165,285 Q165,310 200,340 Q235,310 235,285 Q235,260 215,260 Q200,260 200,280",
    ],
  },
];

export default function ColoringCanvas() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [pathColors, setPathColors] = useState<Record<string, string>>({});
  const [selectedPattern, setSelectedPattern] = useState(PATTERNS[0]);

  const handlePathClick = (pathIndex: number) => {
    const key = `${selectedPattern.id}-${pathIndex}`;
    setPathColors((prev) => ({
      ...prev,
      [key]: selectedColor,
    }));
  };

  const resetCanvas = () => {
    setPathColors({});
  };

  const changePattern = () => {
    const currentIndex = PATTERNS.findIndex((p) => p.id === selectedPattern.id);
    const nextIndex = (currentIndex + 1) % PATTERNS.length;
    setSelectedPattern(PATTERNS[nextIndex]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-display font-semibold mb-2">Mindful Coloring</h2>
        <p className="text-panic-text/70 text-sm">
          Tap shapes to fill them with color. Let creativity calm your mind.
        </p>
      </div>

      {/* Canvas */}
      <Card className="bg-panic-accent/5 border-panic-accent/20">
        <CardContent className="p-4">
          <svg viewBox="0 0 400 400" className="w-full aspect-square">
            <rect width="400" height="400" fill="transparent" />
            {selectedPattern.paths.map((path, index) => {
              const key = `${selectedPattern.id}-${index}`;
              return (
                <path
                  key={key}
                  d={path}
                  fill={pathColors[key] || "transparent"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:opacity-80 text-panic-accent/40"
                  onClick={() => handlePathClick(index)}
                />
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Color palette */}
      <div>
        <p className="text-sm text-panic-text/70 mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Choose a color
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full transition-all ${
                selectedColor === color ? "ring-2 ring-panic-accent scale-110" : "hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={changePattern}
          className="flex-1 gap-2 border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
        >
          <Palette className="w-4 h-4" />
          {selectedPattern.name}
        </Button>
        <Button
          variant="outline"
          onClick={resetCanvas}
          className="gap-2 border-panic-accent/30 text-panic-text hover:bg-panic-accent/10"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
