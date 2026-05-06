import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

const SITE_NAME = "Royal Greenland";
const DEFAULT_TITLE = "Royal Greenland — Manajemen Kosan";
const DEFAULT_DESCRIPTION =
  "Sistem manajemen kos-kosan Royal Greenland untuk kelola kamar, penghuni, dan tagihan pembayaran bulanan.";
const DEFAULT_IMAGE = "/favicon.png";

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = "website",
}: SEOProps) => {
  const { pathname } = useLocation();
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${pathname}`;
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const absoluteImage = image.startsWith("http") ? image : `${origin}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
    </Helmet>
  );
};

export default SEO;
