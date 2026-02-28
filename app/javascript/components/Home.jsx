const RESTAURANT_LINK = '/empanadas-demo'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-rose-500 px-6 pb-24 pt-16 text-white">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-black/10 blur-2xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/80">QueResto Inspired</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              Digital ordering for modern restaurants.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/90 sm:text-lg">
              We help restaurants publish menus, receive orders in real time, and manage delivery flow from one admin panel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={RESTAURANT_LINK} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 shadow-lg transition hover:scale-[1.02]">
                View Demo Restaurant
              </a>
              <a href="/panel/login" className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Admin Login
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/25 bg-black/20 p-6 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold">How it works</h2>
            <ol className="mt-4 space-y-3 text-sm text-white/90">
              <li>1. Customer opens `/:restaurant_name` and browses menu categories.</li>
              <li>2. Customer adds items, adjusts quantity, and places order at checkout.</li>
              <li>3. Restaurant updates status in admin: pending, confirmed, out for delivery, delivered.</li>
              <li>4. Customer tracks status updates live on the order page.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          { title: 'Menu + Checkout', text: 'Fast mobile-first flow with sticky cart and quantity controls.' },
          { title: 'Order Operations', text: 'Board view by status to manage kitchen and delivery workload.' },
          { title: 'Product Control', text: 'Edit products, categories, pricing, and availability instantly.' },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
