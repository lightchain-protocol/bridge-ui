"use client";

import Link from "next/link";
import PixelBlast from "../ui/PixelBlast";
import TextPressure from "../ui/TextPressure";

export default function FooterBottomAnimated() {
  return (
    <div className="footer-bottom-animated relative isolate z-2 w-full overflow-hidden">
      <div className="container mx-auto px-4 border-t border-border-soft pt-10 pb-8 xl:pb-4 relative z-11">
        <p className="text-base font-medium text-content-default text-center">Copyright © 2026 <Link href="/" className="text-content-strong lcai-link-hover">Lightchain Protocol</Link></p>
      </div>
      <div className="relative max-w-[1500px] mx-auto z-10 flex h-[90px] items-center justify-center px-4 sm:h-[110px] sm:px-12 md:h-[150px] lg:h-[200px] xl:h-[300px]">
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
          minFontSize={36}
          maxFontSize={300}
          letterSpacing={20}
          classNameTextPressure="flex w-full items-center justify-center footer-gradient-text z-[10]"
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
