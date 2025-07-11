import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Notes", href: "/notes" },
    { name: "Profile", href: "/profile" },
    { name: "Workspaces", href: "/workspaces" },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Notes App</h2>
      <nav>
        <ul>
          {navLinks.map((link) => (
            <li key={link.name} className="mb-2">
              <Link
                href={link.href}
                className={`block py-2 px-4 rounded-lg ${pathname === link.href ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          {session?.user?.role === "ADMIN" && (
            <li className="mb-2">
              <Link
                href="/admin/dashboard"
                className={`block py-2 px-4 rounded-lg ${pathname === "/admin/dashboard" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                Admin Dashboard
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
