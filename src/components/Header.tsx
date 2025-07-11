import { Button } from "./ui/Button";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      <div className="flex gap-2">
        <Button variant="ghost">Log in</Button>
        <Button>Sign up</Button>
      </div>
    </header>
  );
}
