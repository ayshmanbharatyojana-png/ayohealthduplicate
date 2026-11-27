import {
  LayoutDashboard,
  Calculator,
  ShoppingBag,
  ShoppingCart,
  Landmark,
  Receipt,
  Users,
  Package,
  FolderKanban,
  BarChart3,
  Percent,
  Contact,
  Settings,
  Puzzle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"


export interface NavChild {
  label: string
  href: string
  children?: NavChild[]
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavChild[]
}


export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Immunization", href: "/accounting", icon: Calculator,
    children: [
      { label: "UWIN Daily Session", href: "/uwindailysession" },
      { label: "UWIN Coverage", href: "/uwincoverage" },
      { label: "HMIS vs UWIN", href: "/hmisvsuwin" },
      { label: "Wastage Report", href: "/wastagereport" },
    ],
  },
  { label: "Delivery", href: "/sales", icon: ShoppingBag, 
    children: [
      { label: "MaNTrA", href: "/sales" },
      { label: "HMIS", href: "/sales/estimates" },
      { label: "UWIN", href: "/sales/credit-notes" },
      { label: "HMIS vs MaNTrA vs UWIN", href: "/sales/customers" },
      { label: "Birth Dose", href: "/sales/payments" },
      { label: "JSY Payment", href: "/sales/products" },
    ],
  },
  { label: "Ayushman Bharat", href: "/purchases", icon: ShoppingCart,
    children: [
      { label: "Golden Card Drive", href: "/purchases" },
      { label: "Pre Auth", href: "/purchases/purchase-orders" },
      { label: "BDMP", href: "/purchases/suppliers" },
    ],
  },
  { label: "NCD Screening", href: "/banking", icon: Landmark,
    children: [
      { label: "Composit Score", href: "/banking/accounts" },
      { label: "Login", href: "/banking/feed" },
      { label: "Screening", href: "/banking/reconciliation" },
      { label: "Treatment", href: "/banking/rules" },
      { label: "Follow Up", href: "/banking/statements" },
    ],
  },
  { label: "DVDMS", href: "/expenses", icon: Receipt,
    children: [
      { label: "Indent Recieve Issue", href: "/expenses" },
      { label: "Facility EDL", href: "/expenses/categories" },
      { label: "Budget Utilization", href: "/expenses/approval-workflows" },
    ],
  },
  { label: "iGot Karmayogi", href: "/payroll", icon: Users,
    children: [
      { label: "Registered Users", href: "/payroll" },
      { label: "Course Allotment", href: "/payroll/employees" },
      { label: "Course Complition", href: "/payroll/runs" },
      { label: "Last Course Complition", href: "/payroll/payslips" },
    ],
  },
  { label: "NPPCD", href: "/inventory", icon: Package,
    children: [
      { label: "Monthly Reporting Status", href: "/inventory" },
      { label: "Current Month Status", href: "/inventory/items" },
    ],
  },
  { label: "UPKSK", href: "/projects", icon: FolderKanban,
    children: [
      { label: "Updation Report", href: "/projects" },
      { label: "Equipment", href: "/projects/tasks" },
      { label: "Funtionality", href: "/projects/timesheets" },
      { label: "Facility", href: "/projects/milestones" },
    ],
  },
  { label: "Arogya Mela", href: "/arogyamela", icon: BarChart3,
    children: [
      { label: "Mela Day Report", href: "/reports" },
      { label: "Chief Complaints", href: "/reports/sales" },
      { label: "Old Reports", href: "/arogyamela" },
    ],
  },
  { label: "ABHA", href: "/tax", icon: Percent,
    children: [
      { label: "eKavach ABHA", href: "/tax" },
      { label: "UWIN Bal ABHA", href: "/tax/gst" },
    ],
  },
   { label: "Medlepar", href: "/tax/tds", icon: Percent,
    children: [
      { label: "Post Martem", href: "/tax/tds" },
      { label: "Medico Legal", href: "/tax/tds/deductors" },
      { label: "Doctor wise Status", href: "/tax/tds/deductees" },
      { label: "Facility Doctor", href: "/tax/tds-returns" },
    ],
   },
 ],
},
  { label: "NPCB", href: "/contacts", icon: Contact,
    children: [
      { label: "Report", href: "/contacts" },
    ],
  },
]

export const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Integrations", href: "/integrations", icon: Puzzle },
  { label: "Help & Support", href: "/help", icon: HelpCircle },
]
