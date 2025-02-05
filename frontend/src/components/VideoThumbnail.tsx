import { useRef, useState } from "react"
import { Link } from "react-router-dom"

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"

interface Video {
  _id: string
  url: string
  signedUrl?: string
  title: string
  likes: string[]
  views: number
}

interface VideoThumbnailProps {
  video: Video
}

export default function VideoThumbnail({ video }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)

  //console.log("Video data in VideoThumbnail:", { id: video._id, url: video.url, signedUrl: video.signedUrl })

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video playback error:", e)
    setHasError(true)
  }

  return (
    <Link
      to={`/video/${video._id}`}
      className="group relative aspect-square block overflow-hidden bg-zinc-900 hover:bg-zinc-800"
    >
      <div className="absolute inset-0">
        {hasError ? (
          <img
            src={`${apiUrl}/api/videos/${video._id}/thumbnail`}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={video.signedUrl || video.url}
            className="w-full h-full object-cover"
            playsInline
            muted
            loop
            onError={handleVideoError}
          />
        )}
        <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/60" />
      </div>
      <div className="absolute bottom-2 left-2 right-2 text-white">
        <p className="text-sm font-medium line-clamp-2">{video.title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span>{video.likes.length} likes</span> 
        
        </div>
      </div>
    </Link>
  )
}

