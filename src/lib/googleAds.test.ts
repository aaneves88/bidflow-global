import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GOOGLE_ADS_ID, initGoogleAds, trackGoogleAdsConversion } from "./googleAds";

/** Troca o hostname do jsdom para simular produção e preview. */
function setHostname(hostname: string) {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { hostname, href: `https://${hostname}/` },
  });
}

function pushArgs(): unknown[][] {
  return (window.dataLayer ?? []).filter(Array.isArray) as unknown[][];
}

beforeEach(() => {
  setHostname("orca-mento.app");
  document.head.innerHTML = "";
  window.dataLayer = undefined;
  delete window.gtag;
});

afterEach(() => {
  setHostname("localhost");
  document.head.innerHTML = "";
  window.dataLayer = undefined;
  delete window.gtag;
});

describe("initGoogleAds", () => {
  it("baixa o gtag.js da conta certa e envia o config em produção", () => {
    initGoogleAds();

    const script = document.querySelector<HTMLScriptElement>(
      `script[src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}"]`,
    );
    expect(script).not.toBeNull();
    expect(script?.async).toBe(true);

    const args = pushArgs();
    expect(args.some((a) => a[0] === "config" && a[1] === GOOGLE_ADS_ID)).toBe(true);
  });

  it("não carrega nada fora de produção", () => {
    setHostname("localhost");

    initGoogleAds();

    expect(document.querySelector("script[src*='googletagmanager']")).toBeNull();
    expect(window.dataLayer ?? []).toHaveLength(0);
  });

  it("não baixa uma segunda cópia quando o Tag Manager já carregou o gtag.js", () => {
    // Estado observado no site publicado: o GTM injeta o gtag.js antes do app.
    const gtm = document.createElement("script");
    gtm.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}&cx=c&gtm=4e69u0`;
    document.head.appendChild(gtm);

    initGoogleAds();

    const ours = document.querySelector("script[data-orca-ads]");
    expect(ours).toBeNull();
    // Sem segundo config: o aviso de página já veio da cópia do GTM.
    const configs = pushArgs().filter((a) => a[0] === "config");
    expect(configs).toHaveLength(0);
  });

  it("garante o comando gtag mesmo quando a cópia do GTM não o expõe", () => {
    const gtm = document.createElement("script");
    gtm.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}&cx=c&gtm=4e69u0`;
    document.head.appendChild(gtm);

    initGoogleAds();

    expect(typeof window.gtag).toBe("function");
  });
});

describe("trackGoogleAdsConversion", () => {
  it("usa o gtag quando ele existe", () => {
    const calls: unknown[][] = [];
    window.gtag = (...args: unknown[]) => calls.push(args);

    trackGoogleAdsConversion(`${GOOGLE_ADS_ID}/Label1`, { value: 29.9 });

    expect(calls).toEqual([
      ["event", "conversion", { send_to: `${GOOGLE_ADS_ID}/Label1`, value: 29.9 }],
    ]);
  });

  it("escreve direto na dataLayer quando o gtag não existe", () => {
    delete window.gtag;

    trackGoogleAdsConversion(`${GOOGLE_ADS_ID}/Label2`);

    expect(pushArgs()).toContainEqual([
      "event",
      "conversion",
      { send_to: `${GOOGLE_ADS_ID}/Label2` },
    ]);
  });

  it("não envia nada fora de produção", () => {
    setHostname("localhost");

    trackGoogleAdsConversion(`${GOOGLE_ADS_ID}/Label3`);

    expect(window.dataLayer ?? []).toHaveLength(0);
  });
});
