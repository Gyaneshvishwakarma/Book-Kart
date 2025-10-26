"use client"

import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { BookOpen, User, LogOut, Plus, LayoutDashboard, Shield, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { toast } from "sonner"

export const Navbar = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      // Fetch user profile
      const fetchProfile = async () => {
        const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single()

        if (data) setUserName(data.full_name)
      }

      // Check if user is admin
      const checkAdmin = async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

        if (data?.role === "admin") setIsAdmin(true)
      }

      fetchProfile()
      checkAdmin()
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    navigate("/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BookKart
            </span>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/add-book")}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Book</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 px-3 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-foreground">{userName || "User"}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Menu
                    </div>
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer gap-2 py-2 px-3 rounded-md transition-colors duration-150"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="cursor-pointer gap-2 py-2 px-3 rounded-md transition-colors duration-150"
                      >
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer gap-2 py-2 px-3 rounded-md text-destructive hover:text-destructive transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
