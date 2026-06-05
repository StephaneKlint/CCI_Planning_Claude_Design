import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/p/:path*",
    "/synthese/:path*",
    "/ressources/:path*",
    "/parametres/:path*",
    "/historique/:path*",
    "/presentation/:path*",
    "/aide/:path*",
  ],
};
