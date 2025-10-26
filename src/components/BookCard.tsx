import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number | null;
  condition: string;
  category: string;
  imageUrl: string | null;
  isDonation: boolean;
}

export const BookCard = ({ id, title, author, price, condition, category, imageUrl, isDonation }: BookCardProps) => {
  const navigate = useNavigate();

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

  return (
    <Card 
      className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/book/${id}`)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1 text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{author}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`${getConditionColor(condition)} text-white border-0`}>
            {condition}
          </Badge>
          {isDonation && (
            <Badge variant="outline" className="border-accent text-accent">
              Free
            </Badge>
          )}
          {category === "pdf-books" && (
            <Badge variant="outline" className="border-primary text-primary">
              PDF
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {isDonation ? "FREE" : `₹${price}`}
          </span>
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
            View Details →
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
