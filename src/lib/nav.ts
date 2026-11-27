
import type { ComponentType, SVGProps } from "react";

import {
  DashboardIcon,
  ImmunizationIcon,
  DeliveryIcon,
  AyushmanBharatIcon,
  NcdScreeningIcon,
  DvdmsIcon,
  KarmayogiIcon,
  NppcdIcon,
  UpkskIcon,
  ArogyaMelaIcon,
  AbhaIcon,
  MedleparIcon,
  NpcbIcon,
  SettingsPortalIcon,
  IntegrationsIcon,
  HelpSupportIcon,
} from "../components/icons/custom-icons";

export type PortalIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavChild {
  label: string;
  href: string;
  children?: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: PortalIcon;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  { label: "Health Dashboard", href: "/", icon: DashboardIcon },

  {
    label: "Immunization & Vaccine Wastage",
    href: "/accounting",
    icon: ImmunizationIcon,
    children: [
      { label: "Coverage", href: "/uwindailysession" },
      { label: "Dropout & Leftout", href: "/uwindailysession" },
      { label: "Wastage Report", href: "/wastagereport" },
    ],
  },

  {
    label: "Maternal & Child Health",
    href: "/sales",
    icon: DeliveryIcon,
    children: [
      { label: "HMIS vs MaNTrA vs UWIN", href: "/sales/customers" },
      { label: "Birth Dose", href: "/sales/payments" },
      { label: "JSY Payment", href: "/sales/products" },
    ],
  },

  {
    label: "Ayushman Bharat PM-JAY",
    href: "/purchases",
    icon: AyushmanBharatIcon,
    children: [
      { label: "Golden Card Drive", href: "/purchases" },
      { label: "Pre Auth", href: "/purchases/purchase-orders" },
      { label: "BDMP", href: "/purchases/suppliers" },
    ],
  },

  {
    label: "NCD Screening & Management",
    href: "/banking",
    icon: NcdScreeningIcon,
    children: [
      { label: "Composit Score", href: "/banking/accounts" },
      { label: "Login", href: "/banking/feed" },
      { label: "Screening", href: "/banking/reconciliation" },
      { label: "Treatment", href: "/banking/rules" },
      { label: "Follow Up", href: "/banking/statements" },
    ],
  },

  {
    label: "Drugs & Supply Management",
    href: "/expenses",
    icon: DvdmsIcon,
    children: [
      { label: "Indent Recieve Issue", href: "/expenses" },
      { label: "Facility EDL", href: "/expenses/categories" },
      { label: "Budget Utilization", href: "/expenses/approval-workflows" },
    ],
  },

  {
    label: "Human Resource & Training",
    href: "/payroll",
    icon: KarmayogiIcon,
    children: [
      { label: "Registered Users", href: "/payroll" },
      { label: "Course Allotment", href: "/payroll/employees" },
      { label: "Course Complition", href: "/payroll/runs" },
      { label: "Last Course Complition", href: "/payroll/payslips" },
    ],
  },

  {
    label: "Deafness Control Programme",
    href: "/inventory",
    icon: NppcdIcon,
    children: [
      { label: "Monthly Reporting Status", href: "/inventory" },
      { label: "Current Month Status", href: "/inventory/items" },
    ],
  },

  {
    label: "Health Infrastructure & Equipment",
    href: "/projects",
    icon: UpkskIcon,
    children: [
      { label: "Updation Report", href: "/projects" },
      { label: "Equipment", href: "/projects/tasks" },
      { label: "Funtionality", href: "/projects/timesheets" },
      { label: "Facility", href: "/projects/milestones" },
    ],
  },

  {
    label: "CM Arogya Mela",
    href: "/arogyamela",
    icon: ArogyaMelaIcon,
    children: [
      { label: "Mela Day Report", href: "/reports" },
      { label: "Chief Complaints", href: "/reports/sales" },
      { label: "Old Reports", href: "/arogyamela" },
    ],
  },

  {
    label: "Digital Health & ABHA",
    href: "/tax",
    icon: AbhaIcon,
    children: [
      { label: "eKavach ABHA", href: "/DigitalHealthABHA/eKavachABHA" },
      { label: "UWIN Bal ABHA", href: "/tax/gst" },
    ],
  },

  {
    label: "Medico-Legal Services",
    href: "/tax/tds",
    icon: MedleparIcon,
    children: [
      { label: "Post Martem", href: "/tax/tds" },
      { label: "Medico Legal", href: "/tax/tds/deductors" },
      { label: "Doctor wise Status", href: "/tax/tds/deductees" },
      { label: "Facility Doctor", href: "/tax/tds-returns" },
    ],
  },

  {
    label: "Blindness Control Programme",
    href: "/contacts",
    icon: NpcbIcon,
    children: [
      { label: "Report", href: "/contacts" },
    ],
  },
];

export const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: SettingsPortalIcon },
  { label: "Integrations", href: "/integrations", icon: IntegrationsIcon },
  { label: "Help & Support", href: "/help", icon: HelpSupportIcon },
];
