import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h2>
      <p className="mt-2 text-sm text-gray-600">
        The requested resource could not be found.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Return Home
      </Link>
    </div>
  );
}
