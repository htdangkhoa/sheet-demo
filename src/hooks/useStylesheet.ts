import { useEffect, useState } from "react";

export function useStylesheet(url: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    link.type = "text/css";

    link.onload = () => {
      setLoaded(true);
    };

    link.onerror = () => {
      setLoaded(false);
    };

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [url]);

  return loaded;
}
