"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import styles from "./Login.module.css";

export function LoginForm({ verify, error }: { verify?: boolean; error?: boolean }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(verify ?? false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      await signIn("nodemailer", { email: email.trim(), redirect: false });
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className={styles.verifyBox}>
        <div className={styles.verifyIcon}>✉</div>
        <h2 className={styles.verifyTitle}>Vérifiez vos emails</h2>
        <p className={styles.verifyText}>
          Un lien de connexion vous a été envoyé à <strong>{email || "votre adresse"}</strong>.
          Cliquez dessus pour accéder à Klint Planning.
        </p>
        {!process.env.NEXT_PUBLIC_APP_ENV ||
          process.env.NEXT_PUBLIC_APP_ENV === "development" ? (
          <p className={styles.devHint}>
            En développement, le lien est affiché dans la console du serveur.
          </p>
        ) : null}
        <button className={styles.backBtn} onClick={() => setSubmitted(false)}>
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.errorBanner}>
          Lien invalide ou expiré. Veuillez recommencer.
        </div>
      )}

      <label className={styles.label} htmlFor="email">
        Adresse e-mail
      </label>
      <input
        id="email"
        type="email"
        required
        autoFocus
        autoComplete="email"
        placeholder="prenom.nom@organisation.fr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
        disabled={isPending}
      />

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isPending || !email.trim()}
      >
        {isPending ? "Envoi en cours…" : "Recevoir le lien de connexion"}
      </button>

      <p className={styles.hint}>
        Pas de mot de passe — un lien magique vous sera envoyé par e-mail.
      </p>
    </form>
  );
}
