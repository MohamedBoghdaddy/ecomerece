import { useState, useEffect } from "react";

export default function HtmlLoader({ file }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/" + file)
      .then((res) => res.text())
      .then((htmlContent) => {
        setHtml(htmlContent);

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        doc.querySelectorAll("script").forEach((oldScript) => {
          const newScript = document.createElement("script");

          // COPY TYPE (important for ES modules!)
          if (oldScript.type) newScript.type = oldScript.type;

          // Prevent duplicate loading
          if (oldScript.src) {
            if (document.querySelector(`script[src="${oldScript.src}"]`))
              return;
            newScript.src = oldScript.src;
          } else {
            newScript.textContent = oldScript.innerHTML;
          }

          newScript.async = true;

          document.body.appendChild(newScript);
        });
      });
  }, [file]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
