import Image from "next/image"
import GradientEffect from "@/components/GradientEffect"

export default function CirclePulsePage() {
  return (
    <div className="w-full h-screen bg-neutral-50 relative overflow-hidden">
      {/* Fixed gradient background at bottom */}
      <div className="fixed bottom-0 left-0 w-full h-1/4 z-0 mb-20 opacity-50">
        <GradientEffect />
      </div>
      
      {/* Modal content positioned above gradient */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-3">
        {/* Top section - empty for now */}
        <div></div>
        
        {/* Middle section - Consent Modal Image */}
        <div className="relative flex flex-col items-center">
          <Image
            src="/assets/Consent-modal.png"
            alt="Consent Modal"
            width={1200}
            height={1200}
            className="w-full h-auto"
            priority
          />
        </div>
        
        {/* Bottom section - Granola SVG */}
        <div className="flex justify-center">
          <Image
            src="/assets/Granola_SVG.svg"
            alt="Granola Logo"
            width={220}
            height={32}
            className="h-6 w-auto"
          />
        </div>
      </div>
    </div>
  )
}
