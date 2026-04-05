"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/design-system/components/ui/button";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { Heading } from "@/design-system/components/ui/typography";

export function FeedbackWidget() {
  return (
    <CardWrapper className="relative overflow-hidden">
      <Image
        src="/illustrations/illustration1.png"
        alt=""
        role="presentation"
        width={200}
        height={200}
        className="absolute -right-8 -bottom-16 h-52 w-52 object-contain"
      />
      <div className="flex flex-col items-start gap-3">
        <Heading level={4} className="text-lg">
          Tell Us How We&apos;re Doing
        </Heading>
        <Button variant="outline" size="sm" className="h-8 rounded-full px-5 text-xs font-bold">
          Tell Us
        </Button>
      </div>
    </CardWrapper>
  );
}
