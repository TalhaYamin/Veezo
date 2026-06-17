import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFoundPage() {
  return (
    <Layout>
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-zinc-400">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="mt-8 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black">Back to home</Link>
      </main>
    </Layout>
  );
}
