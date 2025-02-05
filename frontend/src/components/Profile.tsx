"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Camera, Settings, Heart, MessageCircle, Eye, Trash2, Video } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import type { User } from "../types/user"
import VideoThumbnail from "./VideoThumbnail"
import type { Video as ImportedVideo } from "../types/video"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"

interface Video extends ImportedVideo {
  user: {
    _id: string
    username: string
    displayName: string
    avatar: string
  }
}

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"

interface UserProfile extends User {
  uploadedVideos: Video[]
  likedVideos: Video[]
  uploadedVideosCount: number
}

const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export default function Profile() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user: currentUser, token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; videoId: string | null }>({
    isOpen: false,
    videoId: null,
  })

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const userId = id || currentUser?._id
      if (!userId) {
        throw new Error("No user ID available")
      }

      const userResponse = await axios.get(`${apiUrl}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      let uploadedVideos = []
      let likedVideos = []
      try {
        // Fetch uploaded videos
        const uploadedVideosResponse = await axios.get(`${apiUrl}/api/videos/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        uploadedVideos = uploadedVideosResponse.data

        // Fetch liked videos
        const likedVideosResponse = await axios.get(`${apiUrl}/api/videos/liked/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        likedVideos = likedVideosResponse.data
      } catch (videoError) {
        console.error("Error fetching user videos:", videoError)
      }

      const processVideos = (videos: any[]): Video[] => {
        return videos.map((video: any) => ({
          ...video,
          _id: video._id,
          id: video._id,
          url: video.url,
          signedUrl: video.signedUrl || video.url,
          title: video.title || "",
          description: video.description || "",
          thumbnail: video.thumbnail || "",
          likes: Array.isArray(video.likes) ? video.likes : [],
          views: video.views || 0,
          user:
            typeof video.user === "string"
              ? { _id: video.user, username: "", displayName: "", avatar: "" }
              : video.user,
          comments: video.comments || [],
          shares: video.shares || 0,
          tips: video.tips || 0,
          music: video.music || "",
          isLiked: video.isLiked || false,
          commentCount: video.commentCount || 0,
          createdAt: video.createdAt || new Date().toISOString(),
        }))
      }

      const userProfile = {
        ...userResponse.data,
        uploadedVideos: processVideos(uploadedVideos),
        likedVideos: processVideos(likedVideos),
        uploadedVideosCount: uploadedVideos.length,
      }

      setProfile(userProfile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setError("Failed to load profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [id, currentUser, token])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  const displayLikedVideos = (videos: Video[]) => {
    return (
      <div className="grid grid-cols-3 gap-0.5 bg-zinc-900">
        {videos.map((video) => (
          <div key={video._id} className="relative aspect-square">
            <VideoThumbnail video={video} />
          </div>
        ))}
      </div>
    )
  }

  const handleDeleteVideo = (videoId: string) => {
    setDeleteConfirmation({ isOpen: true, videoId })
  }

  const confirmDeleteVideo = async () => {
    if (!deleteConfirmation.videoId) return

    try {
      await axios.delete(`${apiUrl}/api/videos/${deleteConfirmation.videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update the profile state to remove the deleted video
      setProfile((prevProfile) => {
        if (!prevProfile) return null
        return {
          ...prevProfile,
          uploadedVideos: prevProfile.uploadedVideos.filter((video) => video._id !== deleteConfirmation.videoId),
          uploadedVideosCount: prevProfile.uploadedVideosCount - 1,
        }
      })

      // You might want to show a success message here
    } catch (error) {
      console.error("Error deleting video:", error)
      // You might want to show an error message here
    } finally {
      setDeleteConfirmation({ isOpen: false, videoId: null })
    }
  }

  const displayUploadedVideos = (videos: Video[]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video._id} className="cursor-pointer">
              <TableCell onClick={() => navigate(`/video/${video._id}`)}>{video.title}</TableCell>
              <TableCell onClick={() => navigate(`/video/${video._id}`)}>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {video.likes.length}
                </div>
              </TableCell>
              <TableCell onClick={() => navigate(`/video/${video._id}`)}>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViewCount(video.views)}
                </div>
              </TableCell>
              <TableCell onClick={() => navigate(`/video/${video._id}`)}>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {video.commentCount}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteVideo(video._id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const getInitials = (name: string | undefined): string => {
    if (!name) return ""
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  const getTotalLikes = (videos: Video[]): number => {
    return videos.reduce((total, video) => total + video.likes.length, 0)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="fixed inset-0 bg-zinc-900 text-white overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-zinc-800">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">{profile?.displayName || profile?.username}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="text-white hover:bg-zinc-800"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="px-4 py-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-zinc-700">
                <AvatarImage
                  src={`${apiUrl}${profile?.avatar || "/placeholder.svg"}?t=${Date.now()}`}
                  alt={profile?.displayName || profile?.username}
                />
                <AvatarFallback className="bg-zinc-800 text-white text-xl">
                  {getInitials(profile?.displayName || profile?.username || "")}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#d6191e] hover:bg-[#d6191e]/90 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => navigate("/profile/edit")}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <h2 className="mt-4 text-xl font-semibold">@{profile?.username}</h2>

            <p className="mt-2 text-center text-zinc-400 max-w-md">{profile?.bio || "No bio added yet"}</p>

            <div className="w-full mt-4">
              <Button
                variant="outline"
                className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                onClick={() => navigate("/profile/edit")}
              >
                Edit Profile
              </Button>
            </div>

            <div className="flex gap-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-semibold">{profile?.following?.length}</div>
                <div className="text-sm text-zinc-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{profile?.followers?.length}</div>
                <div className="text-sm text-zinc-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{getTotalLikes(profile?.uploadedVideos || [])}</div>
                <div className="text-sm text-zinc-400">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold">{profile?.uploadedVideosCount || 0}</div>
                <div className="text-sm text-zinc-400">Videos</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-1 text-[#d6191e] font-semibold">
                <span>{profile?.tokenBalance}</span>
                <span>π</span>
              </div>
              <Button
                className="mt-2 bg-[#d6191e] text-white hover:bg-[#d6191e]/90"
                onClick={() => navigate("/tokens")}
              >
                Buy Tokens
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="liked" className="w-full">
          <TabsList className="w-full flex justify-center bg-zinc-800 p-1 rounded-lg">
            <TabsTrigger value="liked" className="flex-1 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Liked Videos
            </TabsTrigger>
            <TabsTrigger value="uploaded" className="flex-1 flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              Uploaded Videos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="liked" className="mt-4">
            {profile?.likedVideos && profile.likedVideos.length > 0 ? (
              displayLikedVideos(profile.likedVideos)
            ) : (
              <div className="text-center py-4 text-zinc-400">No liked videos yet</div>
            )}
          </TabsContent>
          <TabsContent value="uploaded" className="mt-4">
            {profile?.uploadedVideos && profile.uploadedVideos.length > 0 ? (
              displayUploadedVideos(profile.uploadedVideos)
            ) : (
              <div className="text-center py-4 text-zinc-400">No uploaded videos yet</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) => setDeleteConfirmation({ isOpen, videoId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVideo}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

