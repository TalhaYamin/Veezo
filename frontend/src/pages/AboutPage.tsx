import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">About VEEZO</p>
          <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Crafted for modern luxury</h1>
          <p className="mt-6 text-zinc-300">
            VEEZO is built on the belief that exceptional clothing should feel timeless, tactile, and expressive. Every collection pairs refined craftsmanship with carefully selected silhouettes that balance structure and softness.
          </p>
          <p className="mt-4 text-zinc-300">
            From outerwear to accessories, each piece is curated to elevate your wardrobe with premium materials and thoughtful details.
          </p>
        </section>
      </main>
    </Layout>
  );
}
