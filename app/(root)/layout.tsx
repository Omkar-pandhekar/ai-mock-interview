import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, signOut } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav>
        <div className="flex items-center justify-between ">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="MockMate Logo"
                width={38}
                height={32}
              />
              <h2 className="text-primary-100">PrepWise</h2>
            </Link>
          </div>
          <div>
            <form action={signOut}>
              <Button
                variant="destructive"
                type="submit"
                className="text-primary-100 hover:text-primary-200 transition-colors"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
