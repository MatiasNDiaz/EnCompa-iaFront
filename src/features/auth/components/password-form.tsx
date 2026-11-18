"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

import { changePasswordAction } from "../actions";
import { PASSWORD_HINT, passwordChangeSchema, type PasswordChangeInput } from "../schemas";

const FIELDS = [
  { name: "current", label: "Contraseña actual", autoComplete: "current-password" },
  { name: "next", label: "Nueva contraseña", autoComplete: "new-password", hint: PASSWORD_HINT },
  { name: "confirm", label: "Repetí la nueva contraseña", autoComplete: "new-password" },
] as const;

export function PasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  useUnsavedChanges(isDirty);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await changePasswordAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    reset();
    toast.success("Contraseña actualizada", "Cerramos la sesión en tus otros dispositivos.");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-6">
      {FIELDS.map((field) => {
        const error = errors[field.name]?.message;
        const hintId = `${field.name}-hint`;
        const errorId = `${field.name}-error`;
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name} className="text-[0.95rem]">
              {field.label}
            </Label>
            <Input
              id={field.name}
              type={visible ? "text" : "password"}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(error)}
              aria-describedby={
                [error ? errorId : null, "hint" in field ? hintId : null]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              className="h-12 bg-background text-base"
              {...register(field.name)}
            />
            {"hint" in field && (
              <p id={hintId} className="text-sm text-muted-foreground">
                {field.hint}
              </p>
            )}
            {error && (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
          className="size-5 accent-olive"
        />
        Mostrar las contraseñas
      </label>

      {serverError && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="h-12 w-full text-base sm:w-fit sm:px-8" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
