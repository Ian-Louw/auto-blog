import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-sage">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-charcoal text-cream py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} AutoBlog - AI-Powered Content Generation - Ian Louw
          </p>
          <p className="text-xs text-stone mt-2">
            Built with Next.js, Node.js, and AWS
          </p>
        </div>
      </footer>
    </div>
  );
}
