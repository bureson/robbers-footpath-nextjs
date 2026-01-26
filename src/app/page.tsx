import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black bg-background">
      <section className="relative flex items-center justify-center w-full h-screen min-h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/jizera-background.jpg')" }}
        ></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full mb-6 text-sm font-semibold">
            <Image
              className="dark:invert"
              src="/calendar.svg"
              alt="Trail date"
              width={16}
              height={16} />
            <span>Květen 2026</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 font-serif leading-tight">
            Loupežnickou pěšinou
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto font-sans">
            Pěší a cyklistická turistická akce v Mníšku u Liberce. Různé trasy od 9 do 80 km, vhodné pro všechny věkové kategorie
          </p>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80">
            <Image
              className="dark:invert"
              src="/place.svg"
              alt="Trail place"
              width={16}
              height={16} />
            <span className="font-medium">Mníšek u Liberce</span>
          </div>
        </div>
      </section>
    </div>
  );
}
