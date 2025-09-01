import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Ticket,
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Headphones,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  user?: any;
  onLogout?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Tickets", href: "/tickets", icon: Ticket, badge: 23 },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Base de Conhecimento", href: "/knowledge", icon: BookOpen },
  { name: "Relatórios", href: "/reports", icon: TrendingUp },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Layout({ children, user, onLogout }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const current = navigation.find(item => item.href === location);
    return current?.name || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-30 hidden md:block">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-card-foreground">ServiceDesk Pro</h2>
              <p className="text-xs text-muted-foreground">v1.0</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-card-foreground"
                      )}
                      data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-card-foreground">
              {getPageTitle()}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">WhatsApp Online</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Buscar tickets, clientes..."
                className="w-64 pl-10"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs">3</Badge>
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="profile-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLogout} data-testid="logout-menu-item">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2">
        <div className="flex justify-around">
          {navigation.slice(0, 4).map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-md",
                  location === item.href ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`mobile-nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
