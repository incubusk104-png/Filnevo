"use client";

import React from "react";
import { motion } from "motion/react";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
  /** Accent color token used for the avatar ring + metric badge. */
  accent?: "velocity-blue" | "insight-cyan" | "efficiency-green" | "warning-amber";
  metric?: string;
  metricLabel?: string;
};

const accentRing: Record<NonNullable<Testimonial["accent"]>, string> = {
  "velocity-blue": "ring-velocity-blue/40",
  "insight-cyan": "ring-insight-cyan/40",
  "efficiency-green": "ring-efficiency-green/40",
  "warning-amber": "ring-warning-amber/40",
};

const accentText: Record<NonNullable<Testimonial["accent"]>, string> = {
  "velocity-blue": "text-velocity-blue",
  "insight-cyan": "text-insight-cyan",
  "efficiency-green": "text-efficiency-green",
  "warning-amber": "text-warning-amber",
};

const accentBadge: Record<NonNullable<Testimonial["accent"]>, string> = {
  "velocity-blue": "badge-info",
  "insight-cyan": "badge-info",
  "efficiency-green": "badge-success",
  "warning-amber": "badge-warning",
};

function TestimonialCard({ text, image, name, role, accent = "velocity-blue", metric, metricLabel }: Testimonial) {
  return (
    <article className="data-card flex h-full w-[320px] shrink-0 flex-col gap-5 p-8 sm:w-[360px]">
      <p className="text-sm leading-relaxed text-text-muted italic">&ldquo;{text}&rdquo;</p>

      {metric && (
        <div className="mt-auto flex items-center gap-2">
          <span className={`badge ${accentBadge[accent]}`}>{metric}</span>
          {metricLabel && (
            <span className={`font-metrics text-xs ${accentText[accent]}`}>{metricLabel}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-neutral-800/40 pt-5">
        <img
          width={44}
          height={44}
          src={image}
          alt={name}
          loading="lazy"
          className={`h-11 w-11 rounded-full object-cover ring-2 ${accentRing[accent]}`}
        />
        <div className="flex flex-col">
          <span className="font-metrics text-sm font-semibold tracking-tight text-neutral-100">
            {name}
          </span>
          <span className="text-xs tracking-tight text-text-muted">{role}</span>
        </div>
      </div>
    </article>
  );
}

export const TestimonialsRow = (props: {
  className?: string;
  testimonials: Testimonial[];
  /** Seconds for one full loop. Larger = slower. */
  duration?: number;
  /** Scroll right-to-left by default; set true for left-to-right. */
  reverse?: boolean;
}) => {
  const { className, testimonials, duration = 40, reverse = false } = props;

  return (
    <div className={className}>
      <motion.div
        aria-hidden={false}
        initial={{ translateX: reverse ? "-50%" : "0%" }}
        animate={{ translateX: reverse ? "0%" : "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex w-max gap-6 pr-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={`${index}-${i}`} {...testimonial} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
