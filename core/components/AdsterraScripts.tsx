import Script from "next/script";
import {
  getAdsterraPopunderScriptUrl,
  getAdsterraPopunderSnippet,
  getAdsterraSocialBarScriptUrl,
  getAdsterraSocialBarSnippet,
  getAdsterraVerificationCode
} from "@/lib/adsterra";

function renderScriptBlock(id: string, scriptUrl: string, snippet: string) {
  if (snippet) {
    return <Script id={id} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: snippet }} />;
  }

  if (scriptUrl) {
    return <Script id={id} strategy="afterInteractive" src={scriptUrl} />;
  }

  return null;
}

export default function AdsterraScripts() {
  const verificationCode = getAdsterraVerificationCode();
  const popunderScriptUrl = getAdsterraPopunderScriptUrl();
  const popunderSnippet = getAdsterraPopunderSnippet();
  const socialBarScriptUrl = getAdsterraSocialBarScriptUrl();
  const socialBarSnippet = getAdsterraSocialBarSnippet();

  return (
    <>
      <meta name="adsterra-site-verification" content={verificationCode} />
      {renderScriptBlock("adsterra-popunder", popunderScriptUrl, popunderSnippet)}
      {renderScriptBlock("adsterra-social-bar", socialBarScriptUrl, socialBarSnippet)}
    </>
  );
}
