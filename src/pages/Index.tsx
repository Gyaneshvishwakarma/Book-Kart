import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Gift, TrendingUp, BookMarked, Code, Microscope, History as HistoryIcon, User, FileText, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number | null;
  condition: string;
  category: string;
  image_url: string | null;
  is_donation: boolean;
}

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [totalBooks, setTotalBooks] = useState(0);
  const [donationBooks, setDonationBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, conditionFilter, typeFilter, categoryFilter, books]);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setBooks(data);
      setFilteredBooks(data);
      setTotalBooks(data.length);
      setDonationBooks(data.filter((b) => b.is_donation).length);
    }
    setLoading(false);
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Condition filter
    if (conditionFilter !== "all") {
      filtered = filtered.filter((book) => book.condition === conditionFilter);
    }

    // Type filter
    if (typeFilter === "sale") {
      filtered = filtered.filter((book) => !book.is_donation);
    } else if (typeFilter === "donation") {
      filtered = filtered.filter((book) => book.is_donation);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((book) => book.category === categoryFilter);
    }

    setFilteredBooks(filtered);
  };

  const categories = [
    { id: "all", name: "All Books", icon: BookOpen },
    { id: "fiction", name: "Fiction", icon: BookMarked },
    { id: "non-fiction", name: "Non-Fiction", icon: BookMarked },
    { id: "textbook", name: "Textbook", icon: BookOpen },
    { id: "programming", name: "Programming", icon: Code },
    { id: "science", name: "Science", icon: Microscope },
    { id: "history", name: "History", icon: HistoryIcon },
    { id: "biography", name: "Biography", icon: User },
    { id: "pdf-books", name: "PDF Books", icon: FileText },
    { id: "general", name: "General", icon: BookOpen },
  ];

  const CategorySidebar = () => (
    <div className="w-64 space-y-2 p-4">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => {
              setCategoryFilter(cat.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              categoryFilter === cat.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-glow to-accent py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              Buy, Sell & Donate Books
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Connect with fellow students to find affordable textbooks and share knowledge
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/add-book">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  List a Book
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border-white/20">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{totalBooks}</p>
                <p className="text-sm text-muted-foreground">Books Available</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">{donationBooks}</p>
                <p className="text-sm text-muted-foreground">Free Donations</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{totalBooks - donationBooks}</p>
                <p className="text-sm text-muted-foreground">Books for Sale</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block flex-shrink-0">
              <div className="sticky top-4">
                <CategorySidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Category Button */}
              <div className="lg:hidden mb-4">
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Menu className="h-4 w-4" />
                      Categories
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <CategorySidebar />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Filters */}
              <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="donation">Free Donation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

              {/* Books Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">No books found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      author={book.author}
                      price={book.price}
                      condition={book.condition}
                      category={book.category}
                      imageUrl={book.image_url}
                      isDonation={book.is_donation}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
