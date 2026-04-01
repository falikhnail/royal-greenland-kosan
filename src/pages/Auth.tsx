import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Building2, CreditCard, Users, BarChart3, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";
import heroImg from "@/assets/auth-hero.jpg";

const slides = [
  {
    icon: Building2,
    title: "Kelola Kamar dengan Mudah",
    description: "Pantau status kamar, harga, dan ketersediaan secara real-time dalam satu dashboard.",
  },
  {
    icon: Users,
    title: "Manajemen Penghuni",
    description: "Data penghuni lengkap dengan riwayat pembayaran dan pengingat otomatis.",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Terorganisir",
    description: "Lacak pembayaran bulanan, status tagihan, dan riwayat transaksi dengan mudah.",
  },
  {
    icon: BarChart3,
    title: "Laporan & Analitik",
    description: "Dapatkan insight bisnis melalui grafik pendapatan, hunian, dan perbandingan tahunan.",
  },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Berhasil masuk!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const slide = slides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — Hero / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImg}
          alt="Royal Greenland building"
          className="absolute inset-0 w-full h-full object-cover"
          width={960}
          height={1080}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sidebar-background))]/95 via-[hsl(var(--sidebar-background))]/60 to-[hsl(var(--sidebar-background))]/30" />

        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Top branding */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sidebar-accent/50 backdrop-blur-sm p-2.5">
              <img src={logo} alt="Royal Greenland" className="h-9 w-9 rounded-md" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Royal Greenland</h2>
              <p className="text-xs text-sidebar-foreground/70">Sistem Manajemen Kosan</p>
            </div>
          </div>

          {/* Carousel */}
          <div className="max-w-md">
            <div
              key={currentSlide}
              className="animate-fade-in"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sidebar-primary/20 backdrop-blur-sm mb-6">
                <SlideIcon className="h-7 w-7 text-sidebar-primary" />
              </div>
              <h3 className="text-2xl font-bold text-sidebar-foreground mb-3">
                {slide.title}
              </h3>
              <p className="text-sidebar-foreground/75 text-base leading-relaxed">
                {slide.description}
              </p>
            </div>

            {/* Dots + Nav */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? "w-8 bg-sidebar-primary"
                        : "w-2 bg-sidebar-foreground/30 hover:bg-sidebar-foreground/50"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-xs text-sidebar-foreground/40">
            © {new Date().getFullYear()} Royal Greenland. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="rounded-2xl bg-sidebar p-3">
                <img src={logo} alt="Royal Greenland" className="h-12 w-12 rounded-lg" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Royal Greenland</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistem Manajemen Kosan</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-foreground">Selamat Datang Kembali</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-1">Masuk</h2>
            <p className="text-xs text-muted-foreground mb-5">
              Masukkan email dan password Anda
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@royalgreenland.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6 lg:hidden">
            © {new Date().getFullYear()} Royal Greenland
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
