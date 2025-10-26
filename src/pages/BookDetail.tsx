import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message must be less than 500 characters"),
});

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price: number | null;
  condition: string;
  category: string;
  pdf_url: string | null;
  image_url: string | null;
  is_donation: boolean;
  seller_id: string;
}

interface Seller {
  full_name: string;
  email: string;
}

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    const { data: bookData, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single();

    if (bookData && !error) {
      setBook(bookData);

      // Fetch seller profile
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", bookData.seller_id)
        .single();

      if (sellerData) setSeller(sellerData);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Please login to contact the seller");
      navigate("/auth");
      return;
    }

    if (!book) return;

    try {
      const validated = messageSchema.parse({ message });
      setSending(true);

      const { error } = await supabase.from("contact_requests").insert({
        book_id: book.id,
        requester_id: user.id,
        seller_id: book.seller_id,
        message: validated.message,
      });

      if (error) throw error;

      toast.success("Message sent successfully!");
      setMessage("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to send message");
      }
    } finally {
      setSending(false);
    }
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      "new": "bg-green-500",
      "like-new": "bg-green-400",
      "good": "bg-blue-500",
      "fair": "bg-yellow-500",
      "poor": "bg-orange-500",
    };
    return colors[condition] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Book not found</p>
        <Button onClick={() => navigate("/")}>Go Back</Button>
      </div>
    );
  }

  const isOwnBook = user?.id === book.seller_id;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Image or PDF Viewer */}
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            {book.category === "pdf-books" && book.pdf_url ? (
              <iframe
                src={book.pdf_url}
                className="h-full w-full"
                title={book.title}
              />
            ) : book.image_url ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <BookOpen className="h-32 w-32 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground">{book.author}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className={`${getConditionColor(book.condition)} text-white border-0`}>
                {book.condition}
              </Badge>
              {book.is_donation && (
                <Badge variant="outline" className="border-accent text-accent">
                  Free Donation
                </Badge>
              )}
              {book.category === "pdf-books" && (
                <Badge variant="outline" className="border-primary text-primary">
                  PDF Book
                </Badge>
              )}
              <Badge variant="outline">
                {book.category.charAt(0).toUpperCase() + book.category.slice(1).replace("-", " ")}
              </Badge>
            </div>

            <div>
              <p className="text-4xl font-bold text-primary">
                {book.is_donation ? "FREE" : `₹${book.price}`}
              </p>
            </div>

            {book.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{book.description}</p>
                </CardContent>
              </Card>
            )}

            {seller && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Seller Information</h3>
                  <p className="text-muted-foreground">{seller.full_name}</p>
                </CardContent>
              </Card>
            )}

            {!isOwnBook && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="message">Send a Message to Seller</Label>
                    <Textarea
                      id="message"
                      placeholder="Hi, I'm interested in this book..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleSendMessage} disabled={sending || !message} className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isOwnBook && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">This is your listing</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
