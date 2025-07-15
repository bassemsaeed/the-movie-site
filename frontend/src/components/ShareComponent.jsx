import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, Copy, Check, X } from "lucide-react";
import { BsTwitterX } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { PiTelegramLogoLight } from "react-icons/pi";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";

const ShareComponent = ({ title, url, mediaType }) => {
  const { lang } = useTheme();
  const [currentUrl, setCurrentUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");

  useEffect(() => {
    setCurrentUrl(url || window.location.href);
  }, [url]);

  const handleCopyLink = async () => {
    if (!navigator.clipboard) {
      setCopyStatus("Failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      setCopyStatus("Failed");
    }
  };

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(
    getTextByLang(
      lang,
      `شاهد ${mediaType === "tv" ? " مسلسل " : " فيلم "} ${title} ! `,
      `Watch this ${mediaType === "tv" ? "series (" : "movie ("} ${title}) ! `,
    ),
  );

  const shareLinks = [
    {
      name: "Twitter",
      icon: <BsTwitterX className="w-7 h-7" />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: "bg-black hover:bg-gray-800",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="w-7 h-7" />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      className: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Telegram",
      icon: <PiTelegramLogoLight className="w-7 h-7" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: "bg-sky-500 hover:bg-sky-600",
    },
  ];

  const renderCopyButtonContent = (lang) => {
    switch (copyStatus) {
      case "Copied!":
        return (
          <>
            <Check size={25} />
          </>
        );
      case "Failed":
        return (
          <>
            <X size={18} /> {getTextByLang(lang, "لم يتم النسخ", "Failed!")}
          </>
        );
      default:
        return (
          <>
            <Copy size={16} /> {getTextByLang(lang, "نسخ", "Copy")}
          </>
        );
    }
  };

  const copyButtonClass = `
    flex items-center justify-center px-2 cursor-pointer gap-2 h-11 rounded-lg font-semibold text-white transition-all duration-200 ease-in-out
    ${
      copyStatus === "Failed"
        ? "bg-red-600 focus:ring-red-500"
        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    }
  `;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      exit={{
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: {
          duration: 0.1,
          ease: "easeIn",
        },
      }}
      className={
        "bg-gray-100 dark:bg-zinc-950 rounded-xl p-5 max-w-md w-full mx-auto shadow-2xl space-y-4  mt-7 self-start  " +
        (lang === "ar" ? "mr-2" : " -ml-0")
      }
    >
      <h3 className="text-lg font-semibold text-center text-slate-800 dark:text-slate-100">
        {getTextByLang(
          lang,
          `شارك ال${mediaType === "tv" ? "مسلسل" : "فيلم"} مع أصدقائك`,
          `Share this ${mediaType === "tv" ? "series" : "movie"} with your friends!`,
        )}
      </h3>

      {/* Social Media Icons */}
      <div className="flex justify-center items-center gap-4">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            className={`flex items-center justify-center w-12 h-12 rounded-full text-white transition-transform duration-200 hover:scale-110 ${link.className}`}
          >
            {link.icon}
          </a>
        ))}
      </div>

      {/* Copy Link Section */}
      <div className="flex items-center gap-2 pt-2">
        <div className="relative flex-grow">
          <Link
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={20}
          />
          <input
            type="text"
            value={currentUrl}
            readOnly
            className="w-full h-11 pl-10 pr-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.target.select()} // Select text on click for easy manual copy
          />
        </div>
        <button onClick={handleCopyLink} className={copyButtonClass}>
          {renderCopyButtonContent(lang)}
        </button>
      </div>
    </motion.div>
  );
};

export default ShareComponent;
