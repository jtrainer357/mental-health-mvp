"use client";

import { Star } from "lucide-react";
import { Card } from "@/design-system/components/ui/card";
import { Badge } from "@/design-system/components/ui/badge";
import { Text } from "@/design-system/components/ui/typography";
import { cn } from "@/design-system/lib/utils";
import type { PatientDetail } from "./types";

interface ReviewsTabProps {
  patient: PatientDetail;
}

export function ReviewsTab({ patient }: ReviewsTabProps) {
  if (!patient.reviews || patient.reviews.length === 0) {
    return (
      <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed py-8">
        <Text size="sm" muted className="text-center">
          No reviews yet
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patient.reviews.map((review) => (
        <Card
          key={review.id}
          className="hover:bg-card-hover/70 p-3 transition-all hover:border-white hover:shadow-md sm:p-4"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {review.reviewType.replace(/_/g, " ")}
                </Badge>
              </div>
              <Text className="mt-2 font-medium">{review.title}</Text>
              <Text size="sm" muted className="mt-1">
                {review.reviewText}
              </Text>
              <Text size="xs" muted className="mt-2">
                By {review.isAnonymous ? "Anonymous" : review.reviewerName || "Anonymous"}
              </Text>
            </div>
            <Text size="xs" muted className="ml-4 shrink-0">
              {new Date(review.reviewDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
