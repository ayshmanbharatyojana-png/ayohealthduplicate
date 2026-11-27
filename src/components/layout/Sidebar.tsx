
import { NavLink, useLocation } from "react-router-dom"
import { LogIn, UserPlus } from "lucide-react"
import { navItems, type NavChild } from "@/lib/nav"
import { cn } from "@/lib/utils"

function Logo() {
  return (
    <div className="flex items-center gap-2 px-5 pt-5 pb-4">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 2 C22 2 27 7 27 13 C27 18 23 21 19 21 C22 21 24 23.5 24 27 C24 29.5 22 31 19.5 31 C16.5 31 15 28.5 15 26"
          stroke="url(#g)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="9" cy="24" r="4" fill="url(#g2)" />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="16" y2="16">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>

      <span className="text-lg font-bold tracking-tight text-foreground">
        Ayodhya Health
      </span>
    </div>
  )
}

// Exact route matching.
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href
}

// Check whether a route belongs to a menu or its descendants.
function subtreeActive(
  pathname: string,
  node: { href: string; children?: NavChild[] }
): boolean {
  if (isActive(pathname, node.href)) return true

  return (
    node.children?.some((child) =>
      subtreeActive(pathname, child)
    ) ?? false
  )
}

// Render nested submenu items.
function NavChildItem({
  child,
  pathname,
  onNavigate,
  depth,
}: {
  child: NavChild
  pathname: string
  onNavigate?: () => void
  depth: number
}) {
  const hasChildren = !!child.children?.length

  const active = hasChildren
    ? subtreeActive(pathname, child)
    : isActive(pathname, child.href)

  return (
    <li>
      <NavLink
        to={child.href}
        onClick={onNavigate}
        className={cn(
          "block truncate rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {child.label}
      </NavLink>

      {hasChildren && active && (
        <ul
          className={cn(
            "border-sidebar-border mt-0.5 flex flex-col gap-0.5 border-l pl-4",
            depth === 0 && "ml-1.5"
          )}
        >
          {child.children!.map((grandchild) => (
            <NavChildItem
              key={grandchild.href}
              child={grandchild}
              pathname={pathname}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// Main sidebar content.
function NavContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()

  // Find the most specific matching top-level menu.
  const activeItem = navItems
    .filter((item) => subtreeActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0]

  return (
    <div className="flex h-full flex-col">
      <Logo />

      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {/* Main health portal navigation */}
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = activeItem?.href === item.href

            const showChildren =
              active && !!item.children?.length

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-active-bg text-sidebar-active-foreground"
                      : "text-sidebar-foreground hover:bg-muted"
                  )}
                >
                  <item.icon
                    className="size-4 shrink-0"
                    strokeWidth={2}
                  />

                  <span className="truncate">
                    {item.label}
                  </span>
                </NavLink>

                {showChildren && (
                  <ul className="mt-0.5 ml-[1.15rem] flex flex-col gap-0.5 border-l border-sidebar-border pl-4">
                    {item.children!.map((child) => (
                      <NavChildItem
                        key={child.href}
                        child={child}
                        pathname={pathname}
                        onNavigate={onNavigate}
                        depth={0}
                      />
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        {/* Authentication navigation */}
        <div className="my-3 h-px bg-sidebar-border" />

        <p className="text-muted-foreground px-3 pb-1 text-[11px] font-semibold tracking-wide uppercase">
          Authentication
        </p>

        <ul className="flex flex-col gap-0.5">
          <li>
            <NavLink
              to="/signin"
              onClick={onNavigate}
              className="text-sidebar-foreground hover:bg-muted flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogIn className="size-4 shrink-0" strokeWidth={2} />
              <span className="truncate">Sign In</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/signup"
              onClick={onNavigate}
              className="text-sidebar-foreground hover:bg-muted flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <UserPlus className="size-4 shrink-0" strokeWidth={2} />
              <span className="truncate">Sign Up</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}

// Desktop sidebar.
export function Sidebar() {
  return (
    <aside className="bg-sidebar border-sidebar-border sticky top-0 hidden h-svh w-64 shrink-0 border-r lg:block">
      <NavContent />
    </aside>
  )
}

// Mobile sidebar.
export function SidebarMobileContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  return <NavContent onNavigate={onNavigate} />
}
