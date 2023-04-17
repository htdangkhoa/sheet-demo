import React, { useEffect, useState } from "react";

export function useScript(url: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.type = "text/javascript";

    // script.onload = () => {
    //   setLoaded(true);
    // };

    // @ts-ignore
    script.onload = script.onreadystatechange = function () {
      // @ts-ignore
      if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
        setLoaded(true);
        // Handle memory leak in IE
        // @ts-ignore
        this.onload = this.onreadystatechange = null;
        // @ts-ignore
        // this.parentNode.removeChild(this);
      }
    };

    script.onerror = () => {
      setLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      setLoaded(false);
    };
  }, [url]);

  return loaded;
}
