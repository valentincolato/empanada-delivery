export default function Home() {
  return (
    <div className="px-8 py-16 text-center font-sans">
      <h1 className="text-5xl font-bold text-slate-900">🫔 Empanada Delivery</h1>
      <p className="mt-4 text-lg text-slate-500">Multi-tenant food ordering platform</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href="/admin/orders"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Restaurant Admin
        </a>
        <a
          href="/super_admin/restaurants"
          className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Super Admin
        </a>
      </div>
    </div>
  )
}
