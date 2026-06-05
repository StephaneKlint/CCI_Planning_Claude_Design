import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Email from "next-auth/providers/nodemailer";
import { db } from "@/lib/db";
import {
  users, accounts, sessions, verificationTokens,
} from "@/lib/db/schema";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable:              users,
    accountsTable:           accounts,
    sessionsTable:           sessions,
    verificationTokensTable: verificationTokens,
  }),

  providers: [
    Email({
      server: {
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY ?? "dev-no-key",
        },
      },
      from: process.env.EMAIL_FROM ?? "Klint Planning <planning@klint-consulting.com>",

      // Custom send function — logs to console if no RESEND_API_KEY (dev mode)
      async sendVerificationRequest({ identifier: email, url, provider }) {
        if (!process.env.RESEND_API_KEY) {
          console.log(`\n🔗 [DEV] Magic link pour ${email}:\n${url}\n`);
          return;
        }

        // Production — send via Resend SMTP (nodemailer)
        const { createTransport } = await import("nodemailer");
        const transport = createTransport(provider.server);
        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: "Connexion à Klint Planning",
          text: `Cliquez sur ce lien pour vous connecter :\n${url}\n\nCe lien expire dans 24h.`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h1 style="font-size:24px;font-weight:800;color:#001036;margin:0 0 8px">Klint Planning</h1>
              <p style="color:#374151;font-size:15px">Cliquez sur le bouton ci-dessous pour vous connecter.</p>
              <a href="${url}"
                 style="display:inline-block;margin:20px 0;padding:12px 28px;background:#001036;color:white;
                        border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">
                Se connecter
              </a>
              <p style="color:#9ca3af;font-size:13px">Ce lien expire dans 24 heures.</p>
            </div>
          `,
        });
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
