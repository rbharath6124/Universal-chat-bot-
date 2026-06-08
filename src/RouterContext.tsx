import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface RouterCtx {
  route: string;
  navigate: (r: string) => void;
}

const Ctx = createContext<RouterCtx>({ route: "home", navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const parseHash = () => {
    let hash = window.location.hash;
    if (hash.includes('#')) {
      const parts = hash.split('#');
      hash = parts[parts.length - 1];
    }
    return hash.replace(/^\//, "") || "home";
  };

  const [route, setRoute] = useState<string>(() => {
    if (typeof window === "undefined") return "home";
    return parseHash();
  });

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (r: string) => {
    window.location.hash = r;
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <Ctx.Provider value={{ route, navigate }}>{children}</Ctx.Provider>;
}

export function useRouter() {
  return useContext(Ctx);
}
