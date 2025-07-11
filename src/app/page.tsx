import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="flex h-full flex-col items-center justify-center gap-6 text-center">
          <h1 className="text-5xl font-bold">Your notes, everywhere</h1>
          <p className="text-lg text-gray-600">
            The simple, fast, and secure note-taking app.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
