import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanHtml(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function detectPortalName(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("jobstreet")) return "Jobstreet";
    if (host.includes("glints")) return "Glints";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("kitalulus")) return "KitaLulus";
    if (host.includes("kalibrr")) return "Kalibrr";
    if (host.includes("indeed")) return "Indeed";
    if (host.includes("dealls")) return "Dealls";
    if (host.includes("karir.com")) return "Karir.com";
    return host.replace(/^www\./, "");
  } catch {
    return "Website Perusahaan";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "URL lowongan wajib diisi." },
        { status: 400 }
      );
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    let html = "";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (response.ok) {
        html = await response.text();
      }
    } catch (fetchErr: any) {
      console.warn("[Admin Crawl-Job] Fetch failed:", fetchErr.message);
    }

    let parsedTitle = "";
    let parsedCompany = "";
    let parsedLocation = "Indonesia";
    let parsedDescription = "";
    let parsedSalary = "";
    let parsedWorkType = "ONSITE";

    // 1. JSON-LD parsing
    if (html) {
      const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        for (const block of jsonLdMatches) {
          try {
            const rawContent = block
              .replace(/<script[^>]*>/i, "")
              .replace(/<\/script>/i, "")
              .trim();
            const data = JSON.parse(rawContent);

            const findJobPosting = (obj: any): any => {
              if (!obj || typeof obj !== "object") return null;
              if (obj["@type"] === "JobPosting") return obj;
              if (Array.isArray(obj["@graph"])) {
                return obj["@graph"].find((item: any) => item["@type"] === "JobPosting") || null;
              }
              return null;
            };

            const jobPosting = findJobPosting(data);
            if (jobPosting) {
              parsedTitle = jobPosting.title || parsedTitle;
              parsedDescription = cleanHtml(jobPosting.description || "");

              if (typeof jobPosting.hiringOrganization === "object") {
                parsedCompany = jobPosting.hiringOrganization.name || parsedCompany;
              } else if (typeof jobPosting.hiringOrganization === "string") {
                parsedCompany = jobPosting.hiringOrganization;
              }

              if (jobPosting.jobLocation?.address) {
                const addr = jobPosting.jobLocation.address;
                const parts = [
                  addr.addressLocality,
                  addr.addressRegion,
                  addr.addressCountry,
                ].filter(Boolean);
                if (parts.length > 0) parsedLocation = parts.join(", ");
              }

              if (jobPosting.baseSalary?.value) {
                const val = jobPosting.baseSalary.value;
                if (typeof val === "object" && (val.minValue || val.maxValue)) {
                  const min = val.minValue ? `Rp${Number(val.minValue).toLocaleString("id-ID")}` : "";
                  const max = val.maxValue ? `Rp${Number(val.maxValue).toLocaleString("id-ID")}` : "";
                  parsedSalary = [min, max].filter(Boolean).join(" - ");
                } else if (typeof val === "number") {
                  parsedSalary = `Rp${val.toLocaleString("id-ID")}`;
                }
              }

              if (jobPosting.employmentType) {
                const emp = String(jobPosting.employmentType).toUpperCase();
                if (emp.includes("REMOTE")) parsedWorkType = "REMOTE";
                else if (emp.includes("HYBRID")) parsedWorkType = "HYBRID";
              }
              break;
            }
          } catch {}
        }
      }

      // 2. OpenGraph fallback
      if (!parsedTitle) {
        const ogTitle = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["'](.*?)["']/i);
        if (ogTitle && ogTitle[1]) {
          parsedTitle = cleanHtml(ogTitle[1]);
        }
      }

      if (!parsedCompany) {
        const ogSiteName = html.match(/<meta\s+(?:property|name)=["']og:site_name["']\s+content=["'](.*?)["']/i);
        if (ogSiteName && ogSiteName[1]) {
          parsedCompany = cleanHtml(ogSiteName[1]);
        }
      }

      if (!parsedDescription) {
        const ogDesc = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description)["']\s+content=["'](.*?)["']/i);
        if (ogDesc && ogDesc[1]) {
          parsedDescription = cleanHtml(ogDesc[1]);
        }
      }
    }

    const portal = detectPortalName(targetUrl);
    if (!parsedCompany && portal) parsedCompany = portal;

    return NextResponse.json({
      success: true,
      data: {
        title: parsedTitle || "",
        company: parsedCompany || "",
        location: parsedLocation || "Indonesia",
        workType: parsedWorkType,
        salary: parsedSalary || "",
        description: parsedDescription || "",
        portal,
        url: targetUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal meng-crawl tautan lowongan." },
      { status: 500 }
    );
  }
}
