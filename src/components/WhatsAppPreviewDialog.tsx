import { useMemo, useState } from "react";
import { MessageCircle, Send, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Full wa.me URL produced by getWhatsAppBillingUrl/getReminderWhatsAppUrl */
  whatsappUrl: string;
  recipientName?: string;
  recipientPhone?: string;
  title?: string;
  /** Called after admin confirms send (window.open already handled) */
  onSent?: () => void;
}

/**
 * Decode the `text` query param of a wa.me URL, allow editing, then send.
 */
const WhatsAppPreviewDialog = ({
  open,
  onOpenChange,
  whatsappUrl,
  recipientName,
  recipientPhone,
  title = "Preview Pesan WhatsApp",
  onSent,
}: Props) => {
  const initialMessage = useMemo(() => {
    try {
      const u = new URL(whatsappUrl);
      return decodeURIComponent(u.searchParams.get("text") ?? "");
    } catch {
      return "";
    }
  }, [whatsappUrl]);

  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  // Reset textarea when dialog reopens with a different message
  useMemo(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  const buildUrl = () => {
    try {
      const u = new URL(whatsappUrl);
      u.searchParams.set("text", message);
      return u.toString();
    } catch {
      return whatsappUrl;
    }
  };

  const handleSend = () => {
    window.open(buildUrl(), "_blank", "noopener,noreferrer");
    onSent?.();
    onOpenChange(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Pesan disalin ke clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin pesan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-success" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {recipientName && (
              <>
                Untuk <span className="font-medium text-foreground">{recipientName}</span>
                {recipientPhone && <span className="text-muted-foreground"> · {recipientPhone}</span>}
                . Periksa & sunting pesan sebelum dikirim.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={14}
            className="resize-none border-0 bg-transparent font-mono text-xs leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {message.length} karakter
        </p>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Disalin" : "Salin"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSend} className="gap-2">
            <Send className="h-4 w-4" />
            Kirim WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppPreviewDialog;
