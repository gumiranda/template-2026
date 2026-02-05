import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Food Delivery";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Marketing Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            {siteName}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/restaurants"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver restaurantes
            </Link>
            <Button asChild>
              <Link href="/register">Cadastrar restaurante</Link>
            </Button>
          </nav>
          <Button asChild className="md:hidden">
            <Link href="/register">Cadastrar</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Marketing Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-5">
            <div>
              <h3 className="font-bold mb-4">{siteName}</h3>
              <p className="text-sm text-muted-foreground">
                Sistema de pedidos online para restaurantes. Delivery e mesa em
                uma única plataforma.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/for/pizzarias" className="hover:text-foreground">
                    Para Pizzarias
                  </Link>
                </li>
                <li>
                  <Link href="/for/hamburguerias" className="hover:text-foreground">
                    Para Hamburguerias
                  </Link>
                </li>
                <li>
                  <Link href="/for/cafeterias" className="hover:text-foreground">
                    Para Cafeterias
                  </Link>
                </li>
                <li>
                  <Link href="/for/bares" className="hover:text-foreground">
                    Para Bares
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soluções</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/solucoes/cardapio-digital-qr-code" className="hover:text-foreground">
                    Cardápio Digital QR Code
                  </Link>
                </li>
                <li>
                  <Link href="/solucoes/pedidos-na-mesa" className="hover:text-foreground">
                    Pedidos na Mesa
                  </Link>
                </li>
                <li>
                  <Link href="/solucoes/comanda-digital" className="hover:text-foreground">
                    Comanda Digital
                  </Link>
                </li>
                <li>
                  <Link href="/solucoes/delivery-proprio" className="hover:text-foreground">
                    Delivery Próprio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Comparações</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/vs/ifood" className="hover:text-foreground">
                    vs iFood
                  </Link>
                </li>
                <li>
                  <Link href="/vs/rappi" className="hover:text-foreground">
                    vs Rappi
                  </Link>
                </li>
                <li>
                  <Link href="/vs/goomer" className="hover:text-foreground">
                    vs Goomer
                  </Link>
                </li>
                <li>
                  <Link href="/vs/anota-ai" className="hover:text-foreground">
                    vs Anota AI
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Começar</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/register" className="hover:text-foreground">
                    Cadastrar restaurante
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:text-foreground">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/restaurants" className="hover:text-foreground">
                    Ver restaurantes
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteName}. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
