import { BookOpen,Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30 py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BookKart
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Buy, Sell & Donate Books -Promotes sustainability through book reuse
          </p>
          <p className="text-xs text-muted-foreground">
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/gyanesh-vishwakarma-01a159245/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Gyanesh Vishwakarma and Krishna Chourasia
                <Linkedin className="h-3 w-3" />
              </a>
            </p>
            <p className="text-xs text-muted-foreground">© {currentYear} BookKart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
