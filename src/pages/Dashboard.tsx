"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Edit, Trash2, MessageSquare, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react"
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

interface Book {
  id: string
  title: string
  author: string
  price: number | null
  condition: string
  image_url: string | null
  is_donation: boolean
}

interface ContactRequest {
  id: string
  message: string
  status: string
  created_at: string
  books: {
    title: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to access dashboard")
      navigate("/auth")
    } else if (user) {
      fetchDashboardData()
    }
  }, [user, authLoading, navigate])

  const fetchDashboardData = async () => {
    if (!user) return

    const { data: booksData } = await supabase
      .from("books")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    if (booksData) setMyBooks(booksData)

    const { data: requestsData } = await supabase
      .from("contact_requests")
      .select(`
        *,
        books (title),
        profiles!contact_requests_requester_id_fkey (full_name, email)
      `)
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    if (requestsData) setContactRequests(requestsData as any)

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete book")
    } else {
      toast.success("Book deleted successfully")
      setMyBooks(myBooks.filter((book) => book.id !== id))
    }
    setDeleteId(null)
  }

  const updateRequestStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_requests").update({ status }).eq("id", id)

    if (error) {
      toast.error("Failed to update status")
    } else {
      toast.success("Status updated")
      setContactRequests(contactRequests.map((req) => (req.id === id ? { ...req, status } : req)))
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-accent/5 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">My Dashboard</h1>
              <p className="text-muted-foreground text-lg">Manage your books and track buyer inquiries</p>
            </div>
            <Button onClick={() => navigate("/add-book")} className="w-full md:w-auto gap-2 h-11 px-6">
              <Plus className="h-5 w-5" />
              Add New Book
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Books Listed</p>
                  <p className="text-3xl font-bold text-foreground">{myBooks.length}</p>
                </div>
                <BookOpen className="h-12 w-12 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Inquiries</p>
                  <p className="text-3xl font-bold text-foreground">
                    {contactRequests.filter((r) => r.status === "pending").length}
                  </p>
                </div>
                <MessageSquare className="h-12 w-12 text-accent/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="books" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">My Books</span>
              <Badge variant="secondary" className="ml-2">
                {myBooks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Inquiries</span>
              <Badge variant="secondary" className="ml-2">
                {contactRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Books Tab */}
          <TabsContent value="books" className="mt-0">
            {myBooks.length === 0 ? (
              <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Books Listed Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start sharing your books with the community. Add your first book to get started!
                  </p>
                  <Button onClick={() => navigate("/add-book")} size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Add Your First Book
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="border-0 overflow-hidden hover:shadow-lg transition-all duration-300 group bg-card/50 backdrop-blur-sm hover:bg-card"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                      {book.image_url ? (
                        <img
                          src={book.image_url || "/placeholder.svg"}
                          alt={book.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <BookOpen className="h-16 w-16 text-muted-foreground/40" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">{book.condition}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 text-foreground mb-1 text-sm">{book.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{book.author}</p>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-lg font-bold text-primary">{book.is_donation ? "FREE" : `₹${book.price}`}</p>
                        {book.is_donation && (
                          <Badge variant="outline" className="text-xs">
                            Donation
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 bg-transparent"
                          onClick={() => navigate(`/edit-book/${book.id}`)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(book.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-0">
            {contactRequests.length === 0 ? (
              <Card className="border-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-accent/10 rounded-full">
                      <MessageSquare className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Inquiries Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    When buyers are interested in your books, their inquiries will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {contactRequests.map((request) => {
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case "completed":
                        return <CheckCircle2 className="h-5 w-5 text-green-500" />
                      case "contacted":
                        return <Clock className="h-5 w-5 text-blue-500" />
                      default:
                        return <AlertCircle className="h-5 w-5 text-amber-500" />
                    }
                  }

                  return (
                    <Card
                      key={request.id}
                      className="border-0 overflow-hidden hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm hover:bg-card"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-clamp-1">{request.books?.title}</CardTitle>
                            <CardDescription className="mt-1">
                              <span className="font-medium text-foreground">From:</span> {request.profiles?.full_name}
                            </CardDescription>
                            <CardDescription className="text-xs">{request.profiles?.email}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <Badge
                              variant={
                                request.status === "completed"
                                  ? "default"
                                  : request.status === "contacted"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="whitespace-nowrap"
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">"{request.message}"</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {request.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, "contacted")}
                              className="gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              Mark as Contacted
                            </Button>
                          )}
                          {request.status === "contacted" && (
                            <Button
                              size="sm"
                              onClick={() => updateRequestStatus(request.id, "completed")}
                              className="gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as Completed
                            </Button>
                          )}
                          {request.status === "completed" && (
                            <Button size="sm" variant="outline" disabled className="gap-2 bg-transparent">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Book Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your book listing and remove it from the
                marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default Dashboard
