import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Notes", href: "/notes" },
    // Add more links as needed
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
        </ul>
      </nav>
    </aside>
  );
}
