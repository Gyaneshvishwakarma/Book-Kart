"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, MessageSquare, Gift, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Stats {
  totalUsers: number
  totalBooks: number
  donationBooks: number
  totalRequests: number
}

interface Book {
  id: string
  title: string
  author: string
  price: number | null
  is_donation: boolean
  profiles: {
    full_name: string
  }
}

interface User {
  user_id: string
  full_name: string
  email: string
  user_roles: {
    role: string
  }
}

interface ContactRequest {
  id: string
  message: string
  status: string
  books: {
    title: string
  }
  profiles: {
    full_name: string
  }
}

const Admin = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBooks: 0,
    donationBooks: 0,
    totalRequests: 0,
  })
  const [books, setBooks] = useState<Book[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAndFetchData()
    } else if (!authLoading) {
      navigate("/auth")
    }
  }, [user, authLoading, navigate])

  const checkAdminAndFetchData = async () => {
    if (!user) return

    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (roleData?.role !== "admin") {
      toast.error("Access denied. Admin only.")
      navigate("/")
      return
    }

    setIsAdmin(true)
    await fetchAdminData()
  }

  const fetchAdminData = async () => {
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    const { count: booksCount } = await supabase.from("books").select("*", { count: "exact", head: true })

    const { count: donationCount } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true })
      .eq("is_donation", true)

    const { count: requestsCount } = await supabase.from("contact_requests").select("*", { count: "exact", head: true })

    setStats({
      totalUsers: usersCount || 0,
      totalBooks: booksCount || 0,
      donationBooks: donationCount || 0,
      totalRequests: requestsCount || 0,
    })

    const { data: booksData } = await supabase
      .from("books")
      .select(`
        *,
        profiles!books_seller_id_fkey (full_name)
      `)
      .order("created_at", { ascending: false })

    if (booksData) setBooks(booksData as any)

    const { data: usersData } = await supabase.from("profiles").select(`
        user_id,
        full_name,
        email
      `)

    if (usersData) {
      const userIds = usersData.map((u: any) => u.user_id)
      const { data: rolesData } = await supabase.from("user_roles").select("user_id, role").in("user_id", userIds)

      const usersWithRoles = usersData.map((user: any) => ({
        ...user,
        user_roles: rolesData?.find((r: any) => r.user_id === user.user_id),
      }))
      setUsers(usersWithRoles as any)
    }

    const { data: requestsData } = await supabase
      .from("contact_requests")
      .select(`
        *,
        books (title),
        profiles!contact_requests_requester_id_fkey (full_name)
      `)
      .order("created_at", { ascending: false })

    if (requestsData) setRequests(requestsData as any)

    setLoading(false)
  }

  const handleDeleteBook = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete book")
    } else {
      toast.success("Book deleted successfully")
      setBooks(books.filter((book) => book.id !== id))
      setStats((prev) => ({ ...prev, totalBooks: prev.totalBooks - 1 }))
    }
    setDeleteBookId(null)
  }

  if (authLoading || loading || !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform's books, users, and requests</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-secondary/50 border border-border">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="books"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Books
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Users</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active members</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Total Books</CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalBooks}</div>
                  <p className="text-xs text-muted-foreground mt-1">Listed items</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Donations</CardTitle>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Gift className="h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.donationBooks}</div>
                  <p className="text-xs text-muted-foreground mt-1">Free listings</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">Requests</CardTitle>
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalRequests}</div>
                  <p className="text-xs text-muted-foreground mt-1">Contact inquiries</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="books" className="mt-8">
            <div className="space-y-3">
              {books.length === 0 ? (
                <Card className="border-border bg-card/50">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No books found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                books.map((book) => (
                  <Card key={book.id} className="border-border bg-card hover:bg-card/80 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-foreground truncate">
                            {book.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            By {book.author} • Listed by {book.profiles?.full_name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={book.is_donation ? "outline" : "default"} className="whitespace-nowrap">
                            {book.is_donation ? "Free" : `₹${book.price}`}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteBookId(book.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-8">
            <div className="space-y-3">
              {users.length === 0 ? (
                <Card className="border-border bg-card/50">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                users.map((user) => (
                  <Card key={user.user_id} className="border-border bg-card hover:bg-card/80 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-foreground">{user.full_name}</CardTitle>
                          <CardDescription className="text-sm mt-1 truncate">{user.email}</CardDescription>
                        </div>
                        <Badge
                          variant={(user.user_roles as any)?.role === "admin" ? "default" : "secondary"}
                          className="whitespace-nowrap flex-shrink-0"
                        >
                          {(user.user_roles as any)?.role || "user"}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-8">
            <div className="space-y-3">
              {requests.length === 0 ? (
                <Card className="border-border bg-card/50">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No requests found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id} className="border-border bg-card hover:bg-card/80 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-foreground">
                            {request.books?.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            From: {request.profiles?.full_name}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            request.status === "completed"
                              ? "default"
                              : request.status === "contacted"
                                ? "secondary"
                                : "outline"
                          }
                          className="whitespace-nowrap flex-shrink-0"
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">{request.message}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteBookId} onOpenChange={() => setDeleteBookId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Book?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this book listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteBookId && handleDeleteBook(deleteBookId)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default Admin
