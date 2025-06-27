import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Link, Copy, Check, X } from "lucide-react";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";

const TwitterXIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: 28, height: 28 }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
};

const WhatsAppIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512" // The original viewBox is preserved.
      style={{ width: 28, height: 28 }}
    >
      {/* PATH 1: The main bubble shape. The hardcoded fill is now "currentColor". */}
      <path
        fill="currentColor"
        d="M427.8,74.4C383.7,30.3,325,6,262.6,6C200.2,6,141.5,30.3,97.3,74.4c-44.1,44.1-68.4,102.8-68.4,165.2 c0,48.5,14.6,94.7,42.3,134.1l-54.5,118c-1.8,3.8-1,8.3,2,11.3c1.9,1.9,4.5,2.9,7.1,2.9c1.4,0,2.8-0.3,4.2-0.9l125.2-57.8 c33,17.1,70,26.1,107.5,26.1c62.4,0,121.1-24.3,165.2-68.4c44.1-44.1,68.4-102.8,68.4-165.2C496.3,177.3,472,118.6,427.8,74.4z M262.6,453.4c-35.8,0-71.2-9-102.3-26.1c-2.8-1.5-6.1-1.6-9-0.3l-105,48.5l45.6-98.6c1.5-3.3,1.1-7.2-1-10.1 c-27.4-37-41.9-80.9-41.9-127C48.9,121.9,144.7,26,262.6,26c117.8,0,213.7,95.9,213.7,213.7S380.4,453.4,262.6,453.4z"
      />
      {/* PATH 2: The inner phone receiver shape. The hardcoded fill is now "currentColor". */}
      <path
        fill="currentColor"
        d="M349.9,272.8c-1.6-0.3-3.2-0.6-4.9-0.8c-8.1-1-17.3-2.1-27,2.1c-5.9,2.5-12.3,7.3-17.9,13.2 c-10.2-4.6-19.1-9.7-26.6-15c-8.7-6.2-15.6-12.8-20.6-19.7c-0.2-0.3-0.5-0.6-0.7-0.9c-10.8-11.8-18.9-29.9-24.2-53.8 c6.9-4.2,12.9-9.4,16.6-14.7c6-8.6,6.9-17.8,7.6-26c0.1-1.6,0.2-3.3,0.2-4.9c0-20.3-7.9-38-21-47.2c-10.1-7.1-23.4-7.1-33-7.1h-0.3 c-7.9,0-15.6,1.7-22.8,5c-8.7,4-16.2,10.2-21.6,18c-5.5,7.8-8.9,16.9-9.7,26.4c-2.1,22.7,0.5,44.9,7.6,66.1 c7.5,22.3,20.3,55.3,44.4,83.7c17.5,22.7,41.4,42.9,72.9,61.6c19.3,11.4,40.5,18.6,63,21.3c2.2,0.3,4.4,0.4,6.6,0.4 c7.3,0,14.6-1.5,21.3-4.4c8.8-3.7,16.4-9.8,22.1-17.4c4.7-6.2,8.1-13.6,9.7-21.3l0.1-0.3c2-9.4,4.8-22.4-0.1-33.8 C385.3,288.4,369.7,277,349.9,272.8z M372.1,332.8l-0.1,0.3c0,0,0,0,0,0c-1,4.8-3.1,9.5-6.1,13.4c-3.6,4.8-8.5,8.6-14,11 c-5.5,2.4-11.6,3.2-17.6,2.5c-19.8-2.4-38.4-8.7-55.2-18.6c-29.4-17.4-51.4-36-67.4-56.8c-0.1-0.1-0.2-0.3-0.3-0.4 c-22-25.8-33.8-56.5-40.8-77.3c-6.3-18.6-8.5-38-6.7-57.9c0.5-6,2.7-11.8,6.1-16.7c3.5-4.9,8.2-8.8,13.7-11.4 c4.6-2.1,9.4-3.2,14.4-3.2h0.4c0.1,0,0.2,0,0.3,0c7.3,0,16.3,0.1,21.1,3.5c9.3,6.5,12.5,20.7,12.5,30.9c0,1,0,2.1-0.1,3.1 c-0.7,7.5-1.2,12.2-4.1,16.2c-2.9,4.1-9.1,8.8-15.8,11.9c-4.2,1.9-6.5,6.4-5.6,10.9c5.8,30.9,15.9,54.5,30.1,70.3 c6.2,8.6,14.6,16.6,24.9,23.9c10.3,7.3,22.8,14.1,37.2,20.1c4.2,1.8,9.1,0.4,11.8-3.2c4.4-5.9,10.2-10.9,14.9-12.9 c4.5-1.9,9.3-1.5,16.7-0.6c1.1,0.1,2.1,0.3,3.1,0.5c9.9,2.1,23.1,8.3,27.6,18.7C375.6,316.6,373.7,325.6,372.1,332.8z"
      />
    </svg>
  );
};

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
      `Watch this ${mediaType === "tv" ? "series (" : "movie ("} ${title}) ! `
    )
  );

  const shareLinks = [
    {
      name: "Twitter",
      icon: <TwitterXIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: "bg-black hover:bg-gray-800",
    },
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      className: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Telegram",
      icon: <Send size={22} />,
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
          `Share this ${mediaType === "tv" ? "series" : "movie"} with your friends!`
        )}
      </h3>

      {/* Social Media Icons */}
      <div className="flex justify-center items-center gap-4 min-h-[48px]">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px", // This is w-12
              height: "48px", // This is h-12
              borderRadius: "9999px", // This is rounded-full
              backgroundColor: "black",
              color: "white",
            }}
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
