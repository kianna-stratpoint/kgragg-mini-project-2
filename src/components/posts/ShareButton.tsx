"use client";

import { useState } from "react";
import {
  Share2,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Linkedin,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonProps {
  slug: string;
  title: string;
}

export function ShareButton({ slug, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Construct full URL
  const getUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/blog/${slug}`;
    }
    return "";
  };

  const handleCopyLink = () => {
    const url = getUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSocial = (platform: "twitter" | "facebook" | "linkedin") => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(title);
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-500 hover:text-gray-900"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <LinkIcon className="mr-2 h-4 w-4" />
          )}
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => shareSocial("twitter")}
          className="cursor-pointer"
        >
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => shareSocial("facebook")}
          className="cursor-pointer"
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => shareSocial("linkedin")}
          className="cursor-pointer"
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
