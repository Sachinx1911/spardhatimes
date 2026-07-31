"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { discountPercent } from "@mahatest/core";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileQuestion,
  Layers3,
  Loader2,
  ShoppingBag,
} from "lucide-react";

import { startPurchase } from "@/app/actions/purchase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface BuyableSeries {
  id: string;
  title: string;
  description: string | null;
  categoryName: string | null;
  examName: string | null;
  testCount: number;
  plannedTotalTests: number;
  priceInPaise: number;
  mrpInPaise: number | null;
  validityMonths: number;
  /** मुदत संपल्यामुळे पुन्हा घेता येणारी — तिच्यावर "Renew" दिसतं. */
  expired: boolean;
}

/** पैशांत रूपांतर. Database मध्ये सगळं पैशांत आहे, रुपयांत नाही. */
function rupees(paise: number): string {
  const rs = paise / 100;
  // पूर्ण रुपये असतील तर दशांश दाखवायचे नाहीत — "₹799" हे "₹799.00" पेक्षा बरं.
  return `₹${rs % 1 === 0 ? rs.toLocaleString("en-IN") : rs.toFixed(2)}`;
}

function validityLabel(months: number): string {
  if (months <= 0) return "आजीवन";
  return `${months} महिने`;
}

/**
 * **Dashboard वरची खरेदी** — plan doc चा टप्पा ५.
 *
 * "My Tests" च्या खाली ठेवली आहे, वेगळ्या tab मध्ये नाही: "या माझ्या series…
 * आणि आणखी काय घेता येईल" असा क्रम नैसर्गिक आहे, आणि आठवा tab त्या पट्टीत बसत
 * नव्हता.
 *
 * किंमत इथे **दाखवली** जाते, पण खरेदी करताना **पाठवली जात नाही** — server
 * स्वतः database मधून घेतो. Client ने पाठवलेली रक्कम वापरली असती तर ₹799 ची
 * series ₹1 ला विकली गेली असती.
 */
export function BuyTestSeries({ series }: { series: BuyableSeries[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  /**
   * विकायला काहीच उरलं नाही **आणि** सांगायचंही काही नाही — तेव्हाच लपवायचं.
   *
   * `feedback` ची अट इथे मुद्दाम आहे. आधी नुसतं `series.length === 0` तपासलं
   * होतं, आणि मग शेवटची उरलेली series घेतल्यावर पूर्ण विभाग — यशाच्या
   * संदेशासह — एकदम नाहीसा होत होता. विद्यार्थ्याने "मिळवा" दाबलं आणि पडद्यावरून
   * सगळंच गायब, म्हणजे झालं की नाही तेच कळत नाही.
   */
  if (series.length === 0 && !feedback) return null;

  const buy = async (s: BuyableSeries) => {
    if (busyId) return;
    setBusyId(s.id);
    setFeedback(null);
    try {
      const result = await startPurchase(s.id);
      if ("error" in result && result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setFeedback({
        type: "success",
        message: `"${s.title}" तुमच्या series मध्ये जोडली गेली.`,
      });
      // Server action ने `revalidatePath` केलं आहे; हा refresh तो नवीन data
      // पडद्यावर आणतो, म्हणून विकत घेतलेली series लगेच वरच्या यादीत दिसते.
      startTransition(() => router.refresh());
    } catch {
      setFeedback({
        type: "error",
        message: "खरेदी पूर्ण झाली नाही. पुन्हा प्रयत्न करा.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {series.length > 0 && (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Buy Test Series</h3>
        </div>
      )}

      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {series.map((s) => {
          const off = discountPercent(s.priceInPaise, s.mrpInPaise);
          const free = s.priceInPaise === 0;
          const busy = busyId === s.id;

          return (
            <Card key={s.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground leading-snug">{s.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[s.examName, s.categoryName].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>

              {s.description && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {s.description}
                </p>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileQuestion className="h-3.5 w-3.5" />
                  {/* नियोजित आकडा जास्त असेल तर तोच दाखवतो — "2 tests" पाहून
                      विद्यार्थ्याला series अपुरी वाटू नये. */}
                  {Math.max(s.testCount, s.plannedTotalTests)} tests
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {validityLabel(s.validityMonths)}
                </span>
                {s.expired && (
                  <span className="text-amber-600 dark:text-amber-400">मुदत संपली</span>
                )}
              </div>

              <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {free ? (
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      मोफत
                    </span>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-foreground">
                        {rupees(s.priceInPaise)}
                      </span>
                      {s.mrpInPaise !== null && off !== null && (
                        <>
                          <span className="text-xs text-muted-foreground line-through">
                            {rupees(s.mrpInPaise)}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {off}% OFF
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() => void buy(s)}
                  disabled={busy || pending}
                  className="font-semibold text-xs shrink-0"
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> थांबा…
                    </span>
                  ) : s.expired ? (
                    "पुन्हा घ्या"
                  ) : free ? (
                    "मिळवा"
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
