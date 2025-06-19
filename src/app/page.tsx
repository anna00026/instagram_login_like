'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { instagramLogin } from "@/lib/instagram-login"

interface InstagramPost {
  id: string
  media_type: string
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUserPosts = async () => {
    if (!(session as any)?.accessToken) return

    setLoading(true)
    try {
      const response = await fetch(`/api/instagram/posts`)
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/instagram/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })
      
      if (response.ok) {
        alert('Post liked successfully!')
      } else {
        alert('Failed to like post')
      }
    } catch (error) {
      console.error('Error liking post:', error)
      alert('Error liking post')
    }
  }

  useEffect(() => {
    if (session) {
      fetchUserPosts()
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Instagram Login & Like App
          </h1>

          {/* Instagram Credentials Display */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🔑 Instagram App Credentials
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CLIENT_ID (Instagram App ID):
                </label>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                  {process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || 'Not configured'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CLIENT_SECRET (Instagram App Secret):
                </label>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                  {process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET || 'Not configured (hidden for security)'}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 How to Get These Credentials:</h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                  <li>Create a new app or select existing app</li>
                  <li>Add "Instagram Basic Display" product</li>
                  <li>Go to Instagram Basic Display → Basic Display</li>
                  <li>Copy the Instagram App ID and App Secret</li>
                  <li>Add your Instagram account as a test user</li>
                  <li>Set redirect URI: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/api/auth/callback/instagram</code></li>
                </ol>
              </div>
            </div>
          </div>

          {!session ? (
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="mb-6">
                <Image
                  src="/instagram-icon.svg"
                  alt="Instagram"
                  width={80}
                  height={80}
                  className="mx-auto mb-4"
                />
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Connect Your Instagram Account
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign in with Instagram to view and like your posts
                </p>
              </div>
              <button
                onClick={() => instagramLogin()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                Sign in with Instagram
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Welcome, {session.user?.name || 'Instagram User'}!
                      </h3>
                      <p className="text-gray-600">Connected to Instagram</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Posts Section */}
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800">Your Posts</h3>
                  <button
                    onClick={fetchUserPosts}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Refresh Posts'}
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border rounded-lg overflow-hidden">
                        {post.media_type === 'IMAGE' && (
                          <Image
                            src={post.media_url}
                            alt="Instagram post"
                            width={300}
                            height={300}
                            className="w-full h-64 object-cover"
                          />
                        )}
                        {post.media_type === 'VIDEO' && (
                          <video
                            src={post.media_url}
                            className="w-full h-64 object-cover"
                            controls
                          />
                        )}
                        <div className="p-4">
                          {post.caption && (
                            <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                              {post.caption}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => likePost(post.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition-colors flex items-center space-x-1"
                            >
                              <span>❤️</span>
                              <span>Like</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No posts found. Make sure your Instagram account has posts to display.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
