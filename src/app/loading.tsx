export default function GlobalLoading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Traffic Light Icon */}
        <div className="flex gap-3 bg-gray-900 p-4 rounded-2xl shadow-lg border-2 border-gray-800">
          {/* Red Light */}
          <div className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-bounce [animation-delay:-0.3s]" />

          {/* Yellow Light */}
          <div className="h-4 w-4 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)] animate-bounce [animation-delay:-0.15s]" />

          {/* Green Light */}
          <div className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-bounce" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="font-playfair-display text-lg font-bold text-gray-900 tracking-wide">
            Calculating route...
          </p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
            Please wait
          </p>
        </div>
      </div>
    </div>
  );
}
