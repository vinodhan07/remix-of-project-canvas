import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Share2, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Globe, 
  Lock,
  Mail,
  Facebook,
  Twitter,
  QrCode,
  Eye,
  Download,
  Users
} from "lucide-react";

const TripShare = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(false);
  const [allowCopy, setAllowCopy] = useState(true);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

  const shareLink = `https://globetrotter.app/shared/${id}/abc123xyz`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (email) {
      toast({
        title: "Invitation sent!",
        description: `An email has been sent to ${email}`,
      });
      setEmail("");
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = "Check out my travel itinerary on GlobeTrotter!";
    let url = "";
    
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareLink)}`;
        break;
    }
    
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link
              to={`/trips/${id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Trip
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-ocean flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Share Your Trip
              </h1>
              <p className="text-muted-foreground">
                European Adventure · Mar 15 - Mar 30, 2026
              </p>
            </div>

            {/* Visibility Settings */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Visibility Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-4">
                    {isPublic ? (
                      <Globe className="w-5 h-5 text-palm" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {isPublic ? "Public" : "Private"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isPublic 
                          ? "Anyone with the link can view"
                          : "Only you can view this trip"
                        }
                      </p>
                    </div>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                {isPublic && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <Download className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Allow Copy</p>
                        <p className="text-sm text-muted-foreground">
                          Let others copy this itinerary to their trips
                        </p>
                      </div>
                    </div>
                    <Switch checked={allowCopy} onCheckedChange={setAllowCopy} />
                  </div>
                )}
              </div>
            </div>

            {/* Share Link */}
            {isPublic && (
              <>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Shareable Link
                  </h2>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={shareLink}
                        readOnly
                        className="pl-10 bg-muted/50"
                      />
                    </div>
                    <Button 
                      variant="ocean" 
                      onClick={handleCopyLink}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  {/* QR Code */}
                  <div className="mt-6 flex items-center justify-center p-6 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-foreground rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-background" />
                      </div>
                      <p className="text-sm text-muted-foreground">Scan to view trip</p>
                    </div>
                  </div>
                </div>

                {/* Social Sharing */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Share on Social
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-2"
                      onClick={() => handleSocialShare("twitter")}
                    >
                      <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                      <span className="text-xs">Twitter</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-2"
                      onClick={() => handleSocialShare("facebook")}
                    >
                      <Facebook className="w-5 h-5 text-[#4267B2]" />
                      <span className="text-xs">Facebook</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col gap-2"
                      onClick={() => handleSocialShare("whatsapp")}
                    >
                      <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                  </div>
                </div>

                {/* Invite by Email */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                    Invite by Email
                  </h2>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="ocean" 
                      onClick={handleSendEmail}
                      disabled={!email}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Stats */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Share Statistics
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <Eye className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">128</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <Users className="w-5 h-5 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold text-foreground">24</p>
                  <p className="text-xs text-muted-foreground">Unique Visitors</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <Download className="w-5 h-5 mx-auto mb-2 text-palm" />
                  <p className="text-2xl font-bold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground">Copies Made</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripShare;
