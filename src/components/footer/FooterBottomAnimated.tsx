"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PixelBlast from "../ui/PixelBlast";
import TextPressure from "../ui/TextPressure";

type TitleScale = { letterSpacing: number; minFontSize: number };

/**
 * On narrow widths, `letterSpacing` + `minFontSize` made the word wider than the
 * title row; `.footer-bottom-animated` uses `overflow-hidden`, so the line was clipped.
 */
function useFooterTitleScale(): TitleScale {
  const [scale, setScale] = useState<TitleScale>({ letterSpacing: 20, minFontSize: 36 });

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w <= 639) {
        setScale({ letterSpacing: 4, minFontSize: 22 });
      } else if (w <= 900) {
        setScale({ letterSpacing: 12, minFontSize: 28 });
      } else {
        setScale({ letterSpacing: 20, minFontSize: 36 });
      }
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return scale;
}

export default function FooterBottomAnimated() {
  const { letterSpacing, minFontSize } = useFooterTitleScale();

  return (
    <div className="footer-bottom-animated relative isolate z-2 w-full overflow-hidden">
      <div className="container mx-auto border-0 px-4 pb-4 pt-4 sm:pb-8 lg:pt-10 xl:pb-4 relative z-11">
        <p className="mb--0 text-center text-base font-medium text-content-default">
          Copyright © 2026{" "}
          <Link href="/" className="text-content-strong lcai-link-hover">
            Lightchain Protocol
          </Link>
        </p>
      </div>
      <div className="relative z-10 mx-auto flex h-[90px] w-full max-w-[300px] min-w-0 items-center justify-center px-4 sm:h-[110px] sm:max-w-[500px] sm:px-8 md:h-[150px] md:px-12 lg:h-[200px] lg:max-w-[1000px] 2xl:h-[300px] 2xl:max-w-[1500px]">
        <TextPressure
          text="Lightchain"
          flex={false}
          alpha={false}
          stroke={false}
          width
          weight={false}
          italic={false}
          textColor="transparent"
          strokeColor="#f5f3ff"
          minFontSize={minFontSize}
          maxFontSize={300}
          letterSpacing={letterSpacing}
          classNameTextPressure="flex w-full min-w-0 items-center justify-center footer-gradient-text z-[10]"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[-1] h-full w-full">
        <PixelBlast
          variant="square"
          pixelSize={2}
          color="#a552f3"
          backgroundColor="#ffffff"
          patternScale={3.5}
          patternDensity={0.2}
          enableRipples={false}
          rippleSpeed={0.3}
          rippleThickness={0.1}
          rippleIntensityScale={0.7}
          speed={0.35}
          transparent={false}
          edgeFade={0.12}
          lightModeBackgroundColor="#000000"
        />
      </div>
    </div>
  );
}
