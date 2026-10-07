import AccountShell from "@/components/cuenta/AccountShell";

export default function CuentaPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}
