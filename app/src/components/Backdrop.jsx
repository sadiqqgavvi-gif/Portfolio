// The page's background: near-black with a faint grid, two very large, very soft glows, a still film grain and
// a vignette. All of it is static, so it costs nothing while the page scrolls.
export default function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh overflow-hidden bg-ink" aria-hidden="true">
      <div className="absolute left-[-20%] top-[-30%] h-[90vmax] w-[90vmax] rounded-full bg-[radial-gradient(closest-side,rgb(255_138_61/0.10),rgb(255_138_61/0.03)_45%,transparent_70%)]" />
      <div className="absolute bottom-[-40%] right-[-25%] h-[100vmax] w-[100vmax] rounded-full bg-[radial-gradient(closest-side,rgb(86_216_201/0.07),rgb(122_92_255/0.03)_50%,transparent_72%)]" />
      <div className="grid-lines absolute inset-0 opacity-60" />
      <div className="grain absolute inset-0 opacity-[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_50%,rgb(0_0_0/0.7)_100%)]" />
    </div>
  );
}
