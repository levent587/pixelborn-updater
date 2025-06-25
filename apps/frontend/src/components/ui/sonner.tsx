import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: "#1e2243",
          color: "var(--color-slate-200)",
          border: "1px solid var(--color-slate-500)",
        },
        actionButtonStyle: {
          background: "#1e2243",
          color: "var(--color-slate200)",
          border: "1px solid var(--color-slate-500)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
