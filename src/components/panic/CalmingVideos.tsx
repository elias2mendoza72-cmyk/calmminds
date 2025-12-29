import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const NATURE_VIDEOS = [
  {
    id: "waterfall",
    name: "Peaceful Waterfall",
    emoji: "💧",
    url: "https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4",
    poster: "https://images.pexels.com/videos/1409899/free-video-1409899.jpg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "stars",
    name: "Starry Night Sky",
    emoji: "✨",
    url: "https://videos.pexels.com/video-files/857251/857251-hd_1920_1080_25fps.mp4",
    poster: "https://images.pexels.com/videos/857251/free-video-857251.jpg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "rain",
    name: "Gentle Rain",
    emoji: "🌧️",
    url: "https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_24fps.mp4",
    poster: "https://images.pexels.com/videos/2491284/free-video-2491284.jpg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    emoji: "🌊",
    url: "https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4",
    poster: "https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "forest",
    name: "Forest Stream",
    emoji: "🌲",
    url: "https://videos.pexels.com/video-files/2611150/2611150-uhd_2560_1440_25fps.mp4",
    poster: "https://images.pexels.com/videos/2611150/free-video-2611150.jpg?auto=compress&cs=tinysrgb&w=600"
  },
  {
    id: "clouds",
    name: "Floating Clouds",
    emoji: "☁️",
    url: "https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_25fps.mp4",
    poster: "https://images.pexels.com/videos/857195/free-video-857195.jpg?auto=compress&cs=tinysrgb&w=600"
  }
];

export default function CalmingVideos() {
  const [selectedVideo, setSelectedVideo] = useState(NATURE_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const handleVideoClick = (video: typeof NATURE_VIDEOS[0]) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const videoEl = document.getElementById("nature-video") as HTMLVideoElement;
    if (videoEl) {
      if (isPlaying) {
        videoEl.pause();
      } else {
        videoEl.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const videoEl = document.getElementById("nature-video") as HTMLVideoElement;
    if (videoEl) {
      videoEl.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const videoEl = document.getElementById("nature-video") as HTMLVideoElement;
    if (videoEl) {
      videoEl.volume = value[0];
      setVolume(value[0]);
    }
  };

  const toggleFullscreen = () => {
    const videoEl = document.getElementById("nature-video") as HTMLVideoElement;
    if (videoEl) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoEl.requestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-panic-accent/10 border-panic-accent/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
            <video
              id="nature-video"
              src={selectedVideo.url}
              poster={selectedVideo.poster}
              className="w-full h-full object-cover"
              loop
              playsInline
              autoPlay={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <div className="w-24">
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
                
                <span className="text-white/80 text-sm flex-1 text-center">
                  {selectedVideo.emoji} {selectedVideo.name}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {NATURE_VIDEOS.map((video) => (
          <button
            key={video.id}
            onClick={() => handleVideoClick(video)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              selectedVideo.id === video.id
                ? "border-panic-accent ring-2 ring-panic-accent/30"
                : "border-panic-accent/20 hover:border-panic-accent/50"
            }`}
          >
            <img
              src={video.poster}
              alt={video.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-2xl">{video.emoji}</span>
            </div>
            <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white text-center truncate">
              {video.name}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-panic-text/60 text-sm">
        Let these peaceful scenes wash away your worries
      </p>
    </div>
  );
}
