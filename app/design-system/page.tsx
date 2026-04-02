"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Design System Components
import { Button } from "@/design-system/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/design-system/components/ui/card";
import { Input } from "@/design-system/components/ui/input";
import { Label } from "@/design-system/components/ui/label";
import { Textarea } from "@/design-system/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/components/ui/select";
import { Checkbox } from "@/design-system/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/design-system/components/ui/radio-group";
import { Switch } from "@/design-system/components/ui/switch";
import { Slider } from "@/design-system/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";
import { Badge } from "@/design-system/components/ui/badge";
import { Heading, Text } from "@/design-system/components/ui/typography";
import { Alert, AlertDescription, AlertTitle } from "@/design-system/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/design-system/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/design-system/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/design-system/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/design-system/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/design-system/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/design-system/components/ui/context-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/design-system/components/ui/navigation-menu";
// LeftNav and NavItem imported but not currently used in demo
// import { LeftNav, NavItem } from "@/design-system/components/ui/left-nav";
import { CardWrapper } from "@/design-system/components/ui/card-wrapper";
import { PriorityAction } from "@/design-system/components/ui/priority-action";
import { AIActionCard } from "@/design-system/components/ui/ai-action-card";
import { PriorityActionCard } from "@/design-system/components/ui/priority-action-card";
import { ActionRowCard } from "@/design-system/components/ui/action-row-card";
import { ScheduleRowCard } from "@/design-system/components/ui/schedule-row-card";
import { MessageRowCard } from "@/design-system/components/ui/message-row-card";
import { OutstandingCard } from "@/design-system/components/ui/outstanding-card";
import { Home, User, Calendar as CalendarIcon, MessageSquare, FileText } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/design-system/components/ui/menubar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/components/ui/tabs";
import { FilterTabs } from "@/design-system/components/ui/filter-tabs";
import { UnderlineTabs } from "@/design-system/components/ui/underline-tabs";
import { PageTransition } from "@/design-system/components/ui/page-transition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/design-system/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/design-system/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/design-system/components/ui/table";
import { Progress } from "@/design-system/components/ui/progress";
import { Skeleton } from "@/design-system/components/ui/skeleton";
import { Separator } from "@/design-system/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/design-system/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/design-system/components/ui/pagination";
import { Calendar } from "@/design-system/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/design-system/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/design-system/components/ui/hover-card";
import { ScrollArea } from "@/design-system/components/ui/scroll-area";
import { AspectRatio } from "@/design-system/components/ui/aspect-ratio";
import { useToast } from "@/design-system/components/ui/use-toast";

// Catalog Components
import { CodeBlock } from "./components/CodeBlock";
import { ColorToken } from "./components/ColorToken";
import {
  TypographyToken,
  SpacingToken,
  ShadowToken,
  RadiusToken,
} from "./components/TypographyToken";
import { ComponentSection } from "./components/ComponentShowcase";

export default function DesignSystemCatalog() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sliderValue, setSliderValue] = useState([50]);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [activeUnderlineTab, setActiveUnderlineTab] = useState("overview");
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading design system...</div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Overview Section */}
      <section id="overview" className="scroll-mt-8 space-y-8">
        <div>
          <h1 className="mb-4 text-5xl font-light tracking-tight text-black">
            Design System Catalog
          </h1>
          <p className="text-muted-foreground text-xl">
            Complete component library and design token reference
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installation</CardTitle>
            <CardDescription>Get started with the design system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock
              code={`// Copy the /design-system folder to your project root
// Import components:
import { Button } from '@/design-system/components/ui/button'
import { Card } from '@/design-system/components/ui/card'`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>All components use design tokens exclusively</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Customize the design system by editing{" "}
              <code className="bg-muted rounded px-1.5 py-0.5">
                /design-system/styles/globals.css
              </code>
              . All color, typography, spacing, shadow, and border radius values are defined as CSS
              custom properties.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Design Tokens Section */}
      <section id="tokens" className="scroll-mt-8 space-y-8">
        <h2 className="text-4xl font-light tracking-tight text-black">Design Tokens</h2>

        {/* Colors */}
        <div id="colors" className="scroll-mt-8 space-y-6">
          <h3 className="text-2xl font-light text-black">Colors</h3>
          <p className="text-muted-foreground">
            All colors use the OKLCH color space for perceptually uniform color manipulation.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <h4 className="mt-4 text-lg font-light text-black">Primary Colors</h4>
            <ColorToken
              name="Background"
              variable="--background"
              value="0.9761 0 0"
              usage={["Page backgrounds", "Main content areas"]}
            />
            <ColorToken
              name="Foreground"
              variable="--foreground"
              value="0.4023 0.0498 189.5853"
              usage={["Body text", "Headings", "Primary content"]}
            />
            <ColorToken
              name="Primary"
              variable="--primary"
              value="0.6790 0.1311 36.0386"
              usage={["Primary buttons", "Primary links", "Focus states"]}
            />
            <ColorToken
              name="Primary Foreground"
              variable="--primary-foreground"
              value="1.0000 0 0"
              usage={["Text on primary backgrounds"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Card & Popover Colors</h4>
            <ColorToken
              name="Card"
              variable="--card"
              value="1.0000 0 0"
              usage={["Card backgrounds", "Elevated surfaces"]}
            />
            <ColorToken
              name="Card Foreground"
              variable="--card-foreground"
              value="0.2795 0.0368 260.0310"
              usage={["Text on cards"]}
            />
            <ColorToken
              name="Popover"
              variable="--popover"
              value="1.0000 0 0"
              usage={["Popover backgrounds", "Dropdown menus"]}
            />
            <ColorToken
              name="Popover Foreground"
              variable="--popover-foreground"
              value="0.2795 0.0368 260.0310"
              usage={["Text in popovers"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Secondary Colors</h4>
            <ColorToken
              name="Secondary"
              variable="--secondary"
              value="1.0000 0 0"
              usage={["Secondary buttons", "Less prominent UI"]}
            />
            <ColorToken
              name="Secondary Foreground"
              variable="--secondary-foreground"
              value="0.3682 0.0638 210.4879"
              usage={["Text on secondary backgrounds"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Neutral/Muted Colors</h4>
            <ColorToken
              name="Muted"
              variable="--muted"
              value="1.0000 0 0"
              usage={["Muted backgrounds", "Subtle areas"]}
            />
            <ColorToken
              name="Muted Foreground"
              variable="--muted-foreground"
              value="0.4413 0.0090 260.7262"
              usage={["Helper text", "Disabled text", "Placeholders"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Accent Colors</h4>
            <ColorToken
              name="Accent"
              variable="--accent"
              value="0.9473 0.0065 185.2685"
              usage={["Hover states", "Selected items"]}
            />
            <ColorToken
              name="Accent Foreground"
              variable="--accent-foreground"
              value="0.3729 0.0306 259.7328"
              usage={["Text on accent backgrounds"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Semantic Colors</h4>
            <ColorToken
              name="Destructive"
              variable="--destructive"
              value="0.4985 0.1865 22.5763"
              usage={["Error states", "Delete buttons", "Warning alerts"]}
            />
            <ColorToken
              name="Destructive Foreground"
              variable="--destructive-foreground"
              value="1.0000 0 0"
              usage={["Text on destructive backgrounds"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Border & Input Colors</h4>
            <ColorToken
              name="Border"
              variable="--border"
              value="0.8761 0 0"
              usage={["Borders", "Dividers"]}
            />
            <ColorToken
              name="Input"
              variable="--input"
              value="0.8687 0.0043 56.3660"
              usage={["Input borders", "Form controls"]}
            />
            <ColorToken
              name="Ring"
              variable="--ring"
              value="0.5620 0.0478 159.1543"
              usage={["Focus rings", "Outline states"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Chart Colors</h4>
            <ColorToken
              name="Chart 1"
              variable="--chart-1"
              value="0.6790 0.1311 36.0386"
              usage={["First data series"]}
            />
            <ColorToken
              name="Chart 2"
              variable="--chart-2"
              value="0.4345 0.0650 206.7827"
              usage={["Second data series"]}
            />
            <ColorToken
              name="Chart 3"
              variable="--chart-3"
              value="0.8041 0.0754 208.7554"
              usage={["Third data series"]}
            />
            <ColorToken
              name="Chart 4"
              variable="--chart-4"
              value="0.5789 0.1405 260.1630"
              usage={["Fourth data series"]}
            />
            <ColorToken
              name="Chart 5"
              variable="--chart-5"
              value="0.5445 0.1358 308.0395"
              usage={["Fifth data series"]}
            />

            <h4 className="mt-8 text-lg font-light text-black">Sidebar Colors</h4>
            <ColorToken
              name="Sidebar Background"
              variable="--sidebar-background"
              value="1.0000 0 0"
              usage={["Sidebar backgrounds"]}
            />
            <ColorToken
              name="Sidebar Foreground"
              variable="--sidebar-foreground"
              value="0.2795 0.0368 260.0310"
              usage={["Sidebar text"]}
            />
            <ColorToken
              name="Sidebar Primary"
              variable="--sidebar-primary"
              value="0.4345 0.0650 206.7827"
              usage={["Active sidebar items"]}
            />
            <ColorToken
              name="Sidebar Accent"
              variable="--sidebar-accent"
              value="0.9490 0.0083 91.4846"
              usage={["Sidebar hover states"]}
            />
          </div>
        </div>

        {/* Typography */}
        <div id="typography" className="scroll-mt-8 space-y-6">
          <h3 className="text-2xl font-light text-black">Typography</h3>

          <div className="space-y-4">
            <h4 className="text-lg font-light text-black">Font Family</h4>
            <TypographyToken
              name="Akkurat LL"
              variable="font-family"
              value="Akkurat LL, system-ui, sans-serif"
              example={
                <div className="space-y-3">
                  <p className="text-2xl font-thin">
                    Thin (100) — The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-2xl font-light">
                    Light (300) — The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-2xl font-normal">
                    Regular (400) — The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-2xl font-bold">
                    Bold (700) — The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-2xl font-black">
                    Black (900) — The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              }
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-light text-black">Headings</h4>
            <div className="bg-background space-y-4 rounded-lg border p-6">
              <Heading level={1}>Heading 1 — Light, 5xl</Heading>
              <Heading level={2}>Heading 2 — Light, 4xl</Heading>
              <Heading level={3}>Heading 3 — Light, 2xl</Heading>
              <Heading level={4}>Heading 4 — Light, xl</Heading>
              <Heading level={5}>Heading 5 — Medium, lg</Heading>
              <Heading level={6}>Heading 6 — Medium, base</Heading>
            </div>
            <CodeBlock
              code={`import { Heading } from '@/design-system/components/ui/typography'

<Heading level={1}>Page Title</Heading>
<Heading level={2}>Section Title</Heading>
<Heading level={3}>Subsection</Heading>

// Render as different element (h2 styled as h1)
<Heading level={1} as={2}>Visually h1, semantically h2</Heading>`}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-light text-black">Text</h4>
            <div className="bg-background space-y-3 rounded-lg border p-6">
              <Text size="xl">Extra large text</Text>
              <Text size="lg">Large text</Text>
              <Text size="base">Base text (default)</Text>
              <Text size="sm">Small text</Text>
              <Text size="xs">Extra small text</Text>
              <Text muted>Muted text for secondary content</Text>
              <Text weight="bold">Bold weight text</Text>
              <Text weight="light">Light weight text</Text>
            </div>
            <CodeBlock
              code={`import { Text } from '@/design-system/components/ui/typography'

<Text>Default paragraph</Text>
<Text size="lg" weight="semibold">Large semibold</Text>
<Text muted>Secondary content</Text>`}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-light text-black">Letter Spacing (Tracking)</h4>
            <SpacingToken
              name="Normal"
              variable="--tracking-normal"
              value="0.02em"
              preview={<p className="text-lg tracking-normal">Example Text</p>}
            />
          </div>
        </div>

        {/* Spacing */}
        <div id="spacing" className="scroll-mt-8 space-y-6">
          <h3 className="text-2xl font-light text-black">Spacing</h3>
          <p className="text-muted-foreground">
            The design system uses Tailwind&apos;s default spacing scale. Custom spacing values can
            be defined in globals.css.
          </p>

          <SpacingToken
            name="Spacing Base"
            variable="--spacing"
            value="0.26rem"
            preview={
              <div
                className="bg-primary h-8 rounded"
                style={{ width: "calc(var(--spacing) * 10)" }}
              />
            }
          />
        </div>

        {/* Shadows */}
        <div id="shadows" className="scroll-mt-8 space-y-6">
          <h3 className="text-2xl font-light text-black">Shadows</h3>

          <div className="grid grid-cols-1 gap-4">
            <ShadowToken
              name="2XS"
              variable="--shadow-2xs"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.01)"
            />
            <ShadowToken
              name="XS"
              variable="--shadow-xs"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.01)"
            />
            <ShadowToken
              name="SM"
              variable="--shadow-sm"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.03), 2px 1px 2px 3px hsl(240 4% 60% / 0.03)"
            />
            <ShadowToken
              name="Default"
              variable="--shadow"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.03), 2px 1px 2px 3px hsl(240 4% 60% / 0.03)"
            />
            <ShadowToken
              name="MD"
              variable="--shadow-md"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.03), 2px 2px 4px 3px hsl(240 4% 60% / 0.03)"
            />
            <ShadowToken
              name="LG"
              variable="--shadow-lg"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.03), 2px 4px 6px 3px hsl(240 4% 60% / 0.03)"
            />
            <ShadowToken
              name="XL"
              variable="--shadow-xl"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.03), 2px 8px 10px 3px hsl(240 4% 60% / 0.03)"
            />
            <ShadowToken
              name="2XL"
              variable="--shadow-2xl"
              value="2px 2px 10px 4px hsl(240 4% 60% / 0.07)"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div id="border-radius" className="scroll-mt-8 space-y-6">
          <h3 className="text-2xl font-light text-black">Border Radius</h3>

          <div className="grid grid-cols-1 gap-4">
            <RadiusToken name="Base Radius" variable="--radius" value="1.525rem" />
          </div>
        </div>
      </section>

      {/* Components Section */}
      <section id="components" className="scroll-mt-8 space-y-16">
        <h2 className="text-4xl font-light tracking-tight text-black">Components</h2>

        {/* Button */}
        <ComponentSection
          id="button"
          title="Button"
          description="Interactive button component with multiple variants, sizes, and states"
          importCode={`import { Button } from '@/design-system/components/ui/button'`}
          guidelines={[
            "Use default variant for primary actions",
            "Use outline variant for secondary actions",
            "Use ghost variant for tertiary actions",
            "Use destructive variant for delete/remove actions",
            "Use size='lg' for hero CTAs",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Variants</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              <CodeBlock
                code={`<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Sizes</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="flex items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">+</Button>
                </div>
              </div>
              <CodeBlock
                code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">+</Button>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">States</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="flex items-center gap-4">
                  <Button>Default</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
              <CodeBlock
                code={`<Button>Default</Button>
<Button disabled>Disabled</Button>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Card */}
        <ComponentSection
          id="card"
          title="Card"
          description="Container component with header, content, and footer sections"
          importCode={`import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/design-system/components/ui/card'`}
          guidelines={[
            "Use CardHeader for titles and descriptions",
            "Use CardContent for main content area",
            "Use CardFooter for actions or additional info",
            "Cards can be nested but use sparingly",
            "Use opacity='default' (90%) for standard cards",
            "Use opacity='transparent' (50%) for Today's Patients cards",
            "Use opacity='solid' (100%) for Today's Actions cards",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Card</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This is the card content area.</p>
                  </CardContent>
                  <CardFooter>
                    <Button>Action</Button>
                  </CardFooter>
                </Card>
              </div>
              <CodeBlock
                code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This is the card content area.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Card with Form</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="demo-email">Email</Label>
                      <Input id="demo-email" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="demo-password">Password</Label>
                      <Input id="demo-password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Sign In</Button>
                  </CardFooter>
                </Card>
              </div>
              <CodeBlock
                code={`<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardDescription>Enter your credentials</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" />
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Sign In</Button>
  </CardFooter>
</Card>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Card Opacity Variants</h3>
            <p className="text-muted-foreground text-sm">
              Cards support three opacity levels for different use cases.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
                <div className="space-y-4">
                  <Card opacity="default" className="p-4">
                    <p className="font-medium">Default (90% opacity)</p>
                    <p className="text-muted-foreground text-sm">
                      Standard cards with subtle transparency
                    </p>
                  </Card>
                  <Card opacity="transparent" className="p-4">
                    <p className="font-medium">Transparent (50% opacity)</p>
                    <p className="text-muted-foreground text-sm">
                      For Today&apos;s Patients schedule cards
                    </p>
                  </Card>
                  <Card opacity="solid" className="p-4">
                    <p className="font-medium">Solid (100% opacity)</p>
                    <p className="text-muted-foreground text-sm">For Today&apos;s Actions cards</p>
                  </Card>
                </div>
              </div>
              <CodeBlock
                code={`{/* Default - 90% opacity with blur */}
<Card opacity="default">
  ...
</Card>

{/* Transparent - 50% opacity */}
<Card opacity="transparent">
  ...
</Card>

{/* Solid - 100% white */}
<Card opacity="solid">
  ...
</Card>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Input */}
        <ComponentSection
          id="input"
          title="Input"
          description="Text input component for forms and user input"
          importCode={`import { Input } from '@/design-system/components/ui/input'`}
          guidelines={[
            "Always pair with a Label component for accessibility",
            "Use appropriate input types (email, password, number, etc.)",
            "Provide clear placeholder text",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Input Types</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-4 rounded-lg border p-6">
                <Input type="text" placeholder="Text input" />
                <Input type="email" placeholder="Email input" />
                <Input type="password" placeholder="Password input" />
                <Input type="number" placeholder="Number input" />
                <Input type="search" placeholder="Search input" />
                <Input type="url" placeholder="URL input" />
                <Input type="tel" placeholder="Phone input" />
                <Input disabled placeholder="Disabled input" />
              </div>
              <CodeBlock
                code={`<Input type="text" placeholder="Text input" />
<Input type="email" placeholder="Email input" />
<Input type="password" placeholder="Password input" />
<Input type="number" placeholder="Number input" />
<Input type="search" placeholder="Search input" />
<Input type="url" placeholder="URL input" />
<Input type="tel" placeholder="Phone input" />
<Input disabled placeholder="Disabled input" />`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Label */}
        <ComponentSection
          id="label"
          title="Label"
          description="Label component for form controls"
          importCode={`import { Label } from '@/design-system/components/ui/label'`}
          guidelines={[
            "Always use with form inputs for accessibility",
            "Use htmlFor to link label to input",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-2 rounded-lg border p-6">
                <Label htmlFor="label-demo">Email Address</Label>
                <Input id="label-demo" type="email" placeholder="you@example.com" />
              </div>
              <CodeBlock
                code={`<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" placeholder="you@example.com" />`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Textarea */}
        <ComponentSection
          id="textarea"
          title="Textarea"
          description="Multi-line text input component"
          importCode={`import { Textarea } from '@/design-system/components/ui/textarea'`}
          guidelines={[
            "Use for multi-line text input",
            "Pair with Label for accessibility",
            "Consider using resize-none for fixed height",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-2 rounded-lg border p-6">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here..." />
              </div>
              <CodeBlock
                code={`<Label htmlFor="message">Message</Label>
<Textarea id="message" placeholder="Type your message here..." />`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Disabled</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Textarea disabled placeholder="Disabled textarea" />
              </div>
              <CodeBlock code={`<Textarea disabled placeholder="Disabled textarea" />`} />
            </div>
          </div>
        </ComponentSection>

        {/* Select */}
        <ComponentSection
          id="select"
          title="Select"
          description="Select dropdown component for choosing from options"
          importCode={`import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/components/ui/select'`}
          guidelines={[
            "Use for selecting from a predefined list of options",
            "Provide a clear placeholder",
            "Group related items when applicable",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Select>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="grape">Grape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CodeBlock
                code={`<Select>
  <SelectTrigger className="w-[280px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
    <SelectItem value="grape">Grape</SelectItem>
  </SelectContent>
</Select>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Checkbox */}
        <ComponentSection
          id="checkbox"
          title="Checkbox"
          description="Checkbox component for boolean selections"
          importCode={`import { Checkbox } from '@/design-system/components/ui/checkbox'`}
          guidelines={[
            "Always pair with a label for accessibility",
            "Use for binary choices or multiple selections",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-4 rounded-lg border p-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="checked" defaultChecked />
                  <Label htmlFor="checked">Checked by default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled" disabled />
                  <Label htmlFor="disabled" className="text-muted-foreground">
                    Disabled
                  </Label>
                </div>
              </div>
              <CodeBlock
                code={`<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>

<div className="flex items-center space-x-2">
  <Checkbox id="checked" defaultChecked />
  <Label htmlFor="checked">Checked by default</Label>
</div>

<div className="flex items-center space-x-2">
  <Checkbox id="disabled" disabled />
  <Label htmlFor="disabled">Disabled</Label>
</div>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Radio Group */}
        <ComponentSection
          id="radio-group"
          title="Radio Group"
          description="Radio button group for single selection from multiple options"
          importCode={`import { RadioGroup, RadioGroupItem } from '@/design-system/components/ui/radio-group'`}
          guidelines={[
            "Use when only one option can be selected",
            "Always provide a default selection when possible",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="r1" />
                    <Label htmlFor="r1">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <Label htmlFor="r2">Comfortable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="r3" />
                    <Label htmlFor="r3">Compact</Label>
                  </div>
                </RadioGroup>
              </div>
              <CodeBlock
                code={`<RadioGroup defaultValue="comfortable">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="default" id="r1" />
    <Label htmlFor="r1">Default</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="comfortable" id="r2" />
    <Label htmlFor="r2">Comfortable</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="compact" id="r3" />
    <Label htmlFor="r3">Compact</Label>
  </div>
</RadioGroup>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Switch */}
        <ComponentSection
          id="switch"
          title="Switch"
          description="Toggle switch for on/off states"
          importCode={`import { Switch } from '@/design-system/components/ui/switch'`}
          guidelines={["Use for immediate on/off settings", "Always pair with a label"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-4 rounded-lg border p-6">
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="default-on" defaultChecked />
                  <Label htmlFor="default-on">Enabled by default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="disabled-switch" disabled />
                  <Label htmlFor="disabled-switch" className="text-muted-foreground">
                    Disabled
                  </Label>
                </div>
              </div>
              <CodeBlock
                code={`<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>

<div className="flex items-center space-x-2">
  <Switch id="default-on" defaultChecked />
  <Label htmlFor="default-on">Enabled by default</Label>
</div>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Slider */}
        <ComponentSection
          id="slider"
          title="Slider"
          description="Slider input for selecting a value from a range"
          importCode={`import { Slider } from '@/design-system/components/ui/slider'`}
          guidelines={[
            "Use for selecting values within a continuous range",
            "Provide visual feedback of the current value",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div className="space-y-4">
                  <Label>Volume: {sliderValue}%</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              <CodeBlock
                code={`const [value, setValue] = useState([50])

<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Avatar */}
        <ComponentSection
          id="avatar"
          title="Avatar"
          description="User avatar component with image and fallback support"
          importCode={`import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/components/ui/avatar'`}
          guidelines={[
            "Always provide a fallback for when images fail to load",
            "Use initials or an icon as fallback",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CodeBlock
                code={`<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Badge */}
        <ComponentSection
          id="badge"
          title="Badge"
          description="Badge component for status indicators and labels"
          importCode={`import { Badge } from '@/design-system/components/ui/badge'`}
          guidelines={[
            "Use default for neutral information",
            "Use destructive for errors or warnings",
            "Keep badge text short and concise",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Variants</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              <CodeBlock
                code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Alert */}
        <ComponentSection
          id="alert"
          title="Alert"
          description="Alert component for important messages"
          importCode={`import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert'`}
          guidelines={[
            "Use default variant for informational messages",
            "Use destructive variant for errors",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Variants</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background space-y-4 rounded-lg border p-6">
                <Alert>
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    You can add components to your app using the cli.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Your session has expired. Please log in again.
                  </AlertDescription>
                </Alert>
              </div>
              <CodeBlock
                code={`<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Alert Dialog */}
        <ComponentSection
          id="alert-dialog"
          title="Alert Dialog"
          description="Modal dialog for important confirmations"
          importCode={`import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/design-system/components/ui/alert-dialog'`}
          guidelines={[
            "Use for destructive actions that require confirmation",
            "Provide clear action labels",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CodeBlock
                code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Dialog */}
        <ComponentSection
          id="dialog"
          title="Dialog"
          description="Modal dialog component for forms and content"
          importCode={`import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/components/ui/dialog'`}
          guidelines={[
            "Use for forms and detailed content",
            "Provide a clear title and description",
            "Include close and action buttons in footer",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" defaultValue="John Doe" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input id="username" defaultValue="@johndoe" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CodeBlock
                code={`<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" defaultValue="John Doe" className="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Sheet */}
        <ComponentSection
          id="sheet"
          title="Sheet"
          description="Slide-out panel component for additional content"
          importCode={`import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/design-system/components/ui/sheet'`}
          guidelines={[
            "Use for secondary navigation or settings",
            "Can slide from any edge (top, right, bottom, left)",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Sheet Sides</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div className="flex flex-wrap gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Right</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>Make changes to your profile here.</SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sheet-name">Name</Label>
                          <Input id="sheet-name" defaultValue="John Doe" />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Left</Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Navigation</SheetTitle>
                        <SheetDescription>Menu items here.</SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Top</Button>
                    </SheetTrigger>
                    <SheetContent side="top">
                      <SheetHeader>
                        <SheetTitle>Notifications</SheetTitle>
                        <SheetDescription>Your recent notifications.</SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Bottom</Button>
                    </SheetTrigger>
                    <SheetContent side="bottom">
                      <SheetHeader>
                        <SheetTitle>Actions</SheetTitle>
                        <SheetDescription>Quick actions menu.</SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              <CodeBlock
                code={`<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Popover */}
        <ComponentSection
          id="popover"
          title="Popover"
          description="Floating content triggered by a button"
          importCode={`import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/design-system/components/ui/popover'`}
          guidelines={["Use for additional information or controls", "Keep content concise"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="leading-none font-medium">Dimensions</h4>
                        <p className="text-muted-foreground text-sm">
                          Set the dimensions for the layer.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Width</Label>
                          <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Height</Label>
                          <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <CodeBlock
                code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <h4 className="font-medium">Dimensions</h4>
      <p className="text-sm text-muted-foreground">
        Set the dimensions for the layer.
      </p>
    </div>
  </PopoverContent>
</Popover>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Tooltip */}
        <ComponentSection
          id="tooltip"
          title="Tooltip"
          description="Informative popup on hover"
          importCode={`import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip'`}
          guidelines={[
            "Use for brief explanatory text",
            "Keep tooltip content short",
            "Wrap app with TooltipProvider",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add to library</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CodeBlock
                code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Dropdown Menu */}
        <ComponentSection
          id="dropdown-menu"
          title="Dropdown Menu"
          description="Menu with actions triggered by a button"
          importCode={`import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu'`}
          guidelines={[
            "Use for action menus",
            "Group related items with separators",
            "Use labels for categorization",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CodeBlock
                code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Context Menu */}
        <ComponentSection
          id="context-menu"
          title="Context Menu"
          description="Right-click menu component"
          importCode={`import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/design-system/components/ui/context-menu'`}
          guidelines={[
            "Use for right-click context actions",
            "Provide relevant actions for the clicked item",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <ContextMenu>
                  <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm">
                    Right click here
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem>Back</ContextMenuItem>
                    <ContextMenuItem>Forward</ContextMenuItem>
                    <ContextMenuItem>Reload</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>View Source</ContextMenuItem>
                    <ContextMenuItem>Inspect</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
              <CodeBlock
                code={`<ContextMenu>
  <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent className="w-64">
    <ContextMenuItem>Back</ContextMenuItem>
    <ContextMenuItem>Forward</ContextMenuItem>
    <ContextMenuItem>Reload</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>View Source</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Navigation Menu */}
        <ComponentSection
          id="navigation-menu"
          title="Navigation Menu"
          description="Navigation menu component with dropdown support"
          importCode={`import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/design-system/components/ui/navigation-menu'`}
          guidelines={["Use for main site navigation", "Group related pages under dropdown menus"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4">
                          <NavigationMenuLink asChild>
                            <a
                              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                              href="/design-system#introduction"
                            >
                              <div className="text-sm leading-none font-medium">Introduction</div>
                              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                Re-usable components built using Radix UI and Tailwind CSS.
                              </p>
                            </a>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <a
                              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                              href="/design-system#installation"
                            >
                              <div className="text-sm leading-none font-medium">Installation</div>
                              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                How to install and configure the design system.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4">
                          <NavigationMenuLink asChild>
                            <a
                              className="hover:bg-accent hover:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                              href="/design-system#button"
                            >
                              <div className="text-sm leading-none font-medium">Button</div>
                              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                Interactive button component.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <CodeBlock
                code={`<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink asChild>
          <a href="#">Introduction</a>
        </NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* LeftNav */}
        <ComponentSection
          id="left-nav"
          title="LeftNav"
          description="Responsive navigation component that displays as a side rail on desktop and bottom nav on mobile"
          importCode={`import { LeftNav, NavItem } from '@/design-system/components/ui/left-nav'
import { Home, User, Calendar, MessageSquare } from 'lucide-react'`}
          guidelines={[
            "Use for primary app navigation",
            "Automatically adapts to desktop (side) and mobile (bottom) layouts",
            "Supports logo, nav items, notifications, and user avatar",
            "Active state shows white icon on dark background",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Preview (Embedded Demo)</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <p className="text-muted-foreground mb-4 text-sm">
                  The LeftNav is a responsive navigation component. On desktop (lg+), it renders as
                  a fixed side navigation. On tablet/mobile, it renders as a fixed bottom navigation
                  bar. View the full implementation on the{" "}
                  <Link href="/home" prefetch={true} className="text-primary underline">
                    home page
                  </Link>
                  .
                </p>
                <div className="bg-muted/30 relative h-[400px] overflow-hidden rounded-lg border">
                  {/* Static preview of nav items */}
                  <div className="bg-card/50 absolute top-4 left-4 flex flex-col items-center gap-4 rounded-lg p-4">
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      Desktop Side Nav
                    </div>
                    {[
                      { icon: Home, label: "Home", active: true },
                      { icon: User, label: "Users" },
                      { icon: CalendarIcon, label: "Calendar" },
                      { icon: MessageSquare, label: "Messages" },
                    ].map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        className={`border-selected-border h-12 w-12 rounded-full border-[0.5px] ${
                          item.active ? "bg-foreground border-0 text-white" : ""
                        }`}
                      >
                        <item.icon className="h-6 w-6" />
                      </Button>
                    ))}
                  </div>
                  {/* Mobile bottom nav preview */}
                  <div className="bg-card/95 absolute right-0 bottom-0 left-0 flex items-center justify-around border-t px-4 py-3 backdrop-blur-sm">
                    <div className="text-muted-foreground absolute -top-6 left-4 text-xs font-medium">
                      Mobile Bottom Nav
                    </div>
                    {[
                      { icon: Home, label: "Home", active: true },
                      { icon: User, label: "Users" },
                      { icon: CalendarIcon, label: "Calendar" },
                      { icon: MessageSquare, label: "Messages" },
                    ].map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        className={`border-selected-border h-11 w-11 rounded-full border-[0.5px] ${
                          item.active ? "bg-foreground border-0 text-white" : ""
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <CodeBlock
                code={`// Define nav items
const navItems: NavItem[] = [
  { icon: Home, label: "Home", active: true },
  { icon: User, label: "Users" },
  { icon: Calendar, label: "Calendar" },
  { icon: MessageSquare, label: "Messages" },
];

// Use the component
<LeftNav
  logo={{
    src: "/logo.svg",
    alt: "Logo",
    width: 96,
    height: 23,
  }}
  items={navItems}
  showNotifications={true}
  notificationCount={3}
  user={{
    initials: "JD",
    name: "John Doe",
    avatarSrc: "/avatar.jpg",
  }}
/>`}
              />
            </div>

            <h3 className="mt-8 text-xl font-light text-black">Props Reference</h3>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prop</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">logo</TableCell>
                    <TableCell className="font-mono text-sm">LogoConfig</TableCell>
                    <TableCell>required</TableCell>
                    <TableCell>Logo configuration (src, alt, width, height)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">items</TableCell>
                    <TableCell className="font-mono text-sm">NavItem[]</TableCell>
                    <TableCell>required</TableCell>
                    <TableCell>Array of navigation items with icon, label, active state</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">showNotifications</TableCell>
                    <TableCell className="font-mono text-sm">boolean</TableCell>
                    <TableCell>true</TableCell>
                    <TableCell>Whether to show the notification bell</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">notificationCount</TableCell>
                    <TableCell className="font-mono text-sm">number</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>Badge count shown on notification icon</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">user</TableCell>
                    <TableCell className="font-mono text-sm">UserConfig</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>User avatar configuration (initials, name, avatarSrc)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentSection>

        {/* Menubar */}
        <ComponentSection
          id="menubar"
          title="Menubar"
          description="Application-style menu bar"
          importCode={`import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/design-system/components/ui/menubar'`}
          guidelines={["Use for application-style menus", "Group related actions under menus"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>New Tab</MenubarItem>
                      <MenubarItem>New Window</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Share</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Print</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Undo</MenubarItem>
                      <MenubarItem>Redo</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Cut</MenubarItem>
                      <MenubarItem>Copy</MenubarItem>
                      <MenubarItem>Paste</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Reload</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Toggle Fullscreen</MenubarItem>
                      <MenubarItem>Hide Sidebar</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
              <CodeBlock
                code={`<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab</MenubarItem>
      <MenubarItem>New Window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Undo</MenubarItem>
      <MenubarItem>Redo</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Tabs */}
        <ComponentSection
          id="tabs"
          title="Tabs"
          description="Tab navigation component"
          importCode={`import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs'`}
          guidelines={[
            "Use for organizing related content",
            "Keep tab labels short and descriptive",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="p-4">
                    <p>Make changes to your account here.</p>
                  </TabsContent>
                  <TabsContent value="password" className="p-4">
                    <p>Change your password here.</p>
                  </TabsContent>
                  <TabsContent value="settings" className="p-4">
                    <p>Adjust your settings here.</p>
                  </TabsContent>
                </Tabs>
              </div>
              <CodeBlock
                code={`<Tabs defaultValue="account" className="w-full">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p>Make changes to your account here.</p>
  </TabsContent>
  <TabsContent value="password">
    <p>Change your password here.</p>
  </TabsContent>
  <TabsContent value="settings">
    <p>Adjust your settings here.</p>
  </TabsContent>
</Tabs>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Filter Tabs */}
        <ComponentSection
          id="filter-tabs"
          title="Filter Tabs"
          description="Pill-style filter tabs for filtering content views"
          importCode={`import { FilterTabs } from '@/design-system/components/ui/filter-tabs'`}
          guidelines={[
            "Use for filtering content views (e.g., All, Shared, Public, Archived)",
            "Keep tab labels short and action-oriented",
            "Active tab is visually distinguished with white background and 1px gray border",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <FilterTabs
                  tabs={[
                    { id: "all", label: "All events" },
                    { id: "shared", label: "Shared" },
                    { id: "public", label: "Public" },
                    { id: "archived", label: "Archived" },
                  ]}
                  activeTab={activeFilterTab}
                  onTabChange={setActiveFilterTab}
                />
              </div>
              <CodeBlock
                code={`const [activeTab, setActiveTab] = useState("all");

<FilterTabs
  tabs={[
    { id: "all", label: "All events" },
    { id: "shared", label: "Shared" },
    { id: "public", label: "Public" },
    { id: "archived", label: "Archived" },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Underline Tabs */}
        <ComponentSection
          id="underline-tabs"
          title="Underline Tabs"
          description="Text-based tabs with underline indicator for section navigation"
          importCode={`import { UnderlineTabs } from '@/design-system/components/ui/underline-tabs'`}
          guidelines={[
            "Use for navigating between content sections (e.g., patient detail views)",
            "Active tab is indicated by a colored underline",
            "Keep tab labels concise and descriptive",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <UnderlineTabs
                  tabs={[
                    { id: "overview", label: "Overview" },
                    { id: "appointments", label: "Appointments" },
                    { id: "medical-records", label: "Medical Records" },
                    { id: "messages", label: "Messages" },
                    { id: "billing", label: "Billing" },
                    { id: "reviews", label: "Reviews" },
                  ]}
                  activeTab={activeUnderlineTab}
                  onTabChange={setActiveUnderlineTab}
                />
              </div>
              <CodeBlock
                code={`const [activeTab, setActiveTab] = useState("overview");

<UnderlineTabs
  tabs={[
    { id: "overview", label: "Overview" },
    { id: "appointments", label: "Appointments" },
    { id: "medical-records", label: "Medical Records" },
    { id: "messages", label: "Messages" },
    { id: "billing", label: "Billing" },
    { id: "reviews", label: "Reviews" },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Page Transition */}
        <ComponentSection
          id="page-transition"
          title="Page Transition"
          description="Subtle, elegant animation for page content on navigation"
          importCode={`import { PageTransition } from '@/design-system/components/ui/page-transition'`}
          guidelines={[
            "Wrap main page content to animate on route changes",
            "Uses Framer Motion for smooth, professional animations",
            "Provides a subtle fade-in and slide-up effect (8px, 300ms)",
            "Consistent across all pages for cohesive user experience",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <PageTransition>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="text-muted-foreground">
                      This content animates in with a subtle fade and slide effect
                    </p>
                  </div>
                </PageTransition>
              </div>
              <CodeBlock
                code={`// Wrap your page content with PageTransition
<main>
  <PageTransition>
    <div className="your-content-wrapper">
      {/* Page content */}
    </div>
  </PageTransition>
</main>`}
              />
            </div>

            <h3 className="text-xl font-light text-black">Animation Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Fade In</p>
                <p className="text-muted-foreground text-sm">Opacity: 0 → 1</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Slide Up</p>
                <p className="text-muted-foreground text-sm">Y offset: 8px → 0</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Duration</p>
                <p className="text-muted-foreground text-sm">300ms with ease-out</p>
              </div>
            </div>
          </div>
        </ComponentSection>

        {/* Accordion */}
        <ComponentSection
          id="accordion"
          title="Accordion"
          description="Collapsible content sections"
          importCode={`import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/design-system/components/ui/accordion'`}
          guidelines={["Use for FAQs or expandable content", "Keep triggers descriptive"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that match the design system.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It&apos;s animated by default with smooth open/close transitions.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <CodeBlock
                code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Collapsible */}
        <ComponentSection
          id="collapsible"
          title="Collapsible"
          description="Expandable/collapsible content section"
          importCode={`import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design-system/components/ui/collapsible'`}
          guidelines={[
            "Use for toggling visibility of content",
            "Provide clear indication of collapsed/expanded state",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Collapsible
                  open={isCollapsibleOpen}
                  onOpenChange={setIsCollapsibleOpen}
                  className="w-full space-y-2"
                >
                  <div className="flex items-center justify-between space-x-4">
                    <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {isCollapsibleOpen ? "Hide" : "Show"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    @radix-ui/primitives
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      @radix-ui/colors
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      @stitches/react
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <CodeBlock
                code={`const [isOpen, setIsOpen] = useState(false)

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <div className="flex items-center justify-between">
    <h4>@peduarte starred 3 repositories</h4>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">
        {isOpen ? "Hide" : "Show"}
      </Button>
    </CollapsibleTrigger>
  </div>
  <div className="rounded-md border px-4 py-3">
    @radix-ui/primitives
  </div>
  <CollapsibleContent>
    <div className="rounded-md border px-4 py-3">
      @radix-ui/colors
    </div>
  </CollapsibleContent>
</Collapsible>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Table */}
        <ComponentSection
          id="table"
          title="Table"
          description="Data table component"
          importCode={`import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table'`}
          guidelines={[
            "Use for displaying tabular data",
            "Include proper headers for accessibility",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV002</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>PayPal</TableCell>
                      <TableCell className="text-right">$150.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV003</TableCell>
                      <TableCell>Unpaid</TableCell>
                      <TableCell>Bank Transfer</TableCell>
                      <TableCell className="text-right">$350.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <CodeBlock
                code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Progress */}
        <ComponentSection
          id="progress"
          title="Progress"
          description="Progress indicator component"
          importCode={`import { Progress } from '@/design-system/components/ui/progress'`}
          guidelines={[
            "Use to show completion status",
            "Provide context about what the progress represents",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-6 rounded-lg border p-6">
                <div className="space-y-2">
                  <Label>0%</Label>
                  <Progress value={0} />
                </div>
                <div className="space-y-2">
                  <Label>25%</Label>
                  <Progress value={25} />
                </div>
                <div className="space-y-2">
                  <Label>50%</Label>
                  <Progress value={50} />
                </div>
                <div className="space-y-2">
                  <Label>75%</Label>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <Label>100%</Label>
                  <Progress value={100} />
                </div>
              </div>
              <CodeBlock
                code={`<Progress value={0} />
<Progress value={25} />
<Progress value={50} />
<Progress value={75} />
<Progress value={100} />`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Skeleton */}
        <ComponentSection
          id="skeleton"
          title="Skeleton"
          description="Loading placeholder component"
          importCode={`import { Skeleton } from '@/design-system/components/ui/skeleton'`}
          guidelines={["Use to indicate loading content", "Match skeleton shape to content shape"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
              <CodeBlock
                code={`<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Card Loading State</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </div>
              <CodeBlock
                code={`<Card>
  <CardHeader>
    <Skeleton className="h-6 w-[150px]" />
    <Skeleton className="h-4 w-[250px]" />
  </CardHeader>
  <CardContent className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </CardContent>
</Card>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Toast */}
        <ComponentSection
          id="toast"
          title="Toast"
          description="Toast notification component"
          importCode={`import { useToast } from '@/design-system/components/ui/use-toast'
import { Toaster } from '@/design-system/components/ui/toaster'`}
          guidelines={[
            "Use for brief, non-blocking notifications",
            "Include Toaster component in your app root",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background space-y-4 rounded-lg border p-6">
                <Button
                  onClick={() => {
                    toast({
                      title: "Success!",
                      description: "Your action was completed successfully.",
                    });
                  }}
                >
                  Show Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast({
                      variant: "destructive",
                      title: "Error!",
                      description: "Something went wrong.",
                    });
                  }}
                >
                  Show Error Toast
                </Button>
              </div>
              <CodeBlock
                code={`const { toast } = useToast()

<Button onClick={() => {
  toast({
    title: "Success!",
    description: "Your action was completed successfully.",
  })
}}>
  Show Toast
</Button>

<Button variant="destructive" onClick={() => {
  toast({
    variant: "destructive",
    title: "Error!",
    description: "Something went wrong.",
  })
}}>
  Show Error Toast
</Button>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Separator */}
        <ComponentSection
          id="separator"
          title="Separator"
          description="Visual divider component"
          importCode={`import { Separator } from '@/design-system/components/ui/separator'`}
          guidelines={[
            "Use to visually separate content",
            "Available in horizontal and vertical orientations",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div>
                  <div className="space-y-1">
                    <h4 className="text-sm leading-none font-medium">Radix Primitives</h4>
                    <p className="text-muted-foreground text-sm">
                      An open-source UI component library.
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex h-5 items-center space-x-4 text-sm">
                    <div>Blog</div>
                    <Separator orientation="vertical" />
                    <div>Docs</div>
                    <Separator orientation="vertical" />
                    <div>Source</div>
                  </div>
                </div>
              </div>
              <CodeBlock
                code={`<div className="space-y-1">
  <h4 className="text-sm font-medium">Radix Primitives</h4>
  <p className="text-sm text-muted-foreground">
    An open-source UI component library.
  </p>
</div>
<Separator className="my-4" />
<div className="flex h-5 items-center space-x-4 text-sm">
  <div>Blog</div>
  <Separator orientation="vertical" />
  <div>Docs</div>
  <Separator orientation="vertical" />
  <div>Source</div>
</div>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Breadcrumb */}
        <ComponentSection
          id="breadcrumb"
          title="Breadcrumb"
          description="Navigation breadcrumb component"
          importCode={`import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/design-system/components/ui/breadcrumb'`}
          guidelines={["Use to show navigation hierarchy", "Current page should not be a link"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <CodeBlock
                code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Pagination */}
        <ComponentSection
          id="pagination"
          title="Pagination"
          description="Pagination navigation component"
          importCode={`import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/design-system/components/ui/pagination'`}
          guidelines={["Use for navigating through paginated content", "Show current page clearly"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              <CodeBlock
                code={`<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Calendar */}
        <ComponentSection
          id="calendar"
          title="Calendar"
          description="Date picker calendar component"
          importCode={`import { Calendar } from '@/design-system/components/ui/calendar'`}
          guidelines={["Use for date selection", "Can be used standalone or in a popover"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background flex justify-center rounded-lg border p-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
              <CodeBlock
                code={`const [date, setDate] = useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Command */}
        <ComponentSection
          id="command"
          title="Command"
          description="Command palette / search component"
          importCode={`import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/design-system/components/ui/command'`}
          guidelines={["Use for search and command functionality", "Group related items together"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-background rounded-lg border p-6">
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem>Calendar</CommandItem>
                      <CommandItem>Search Emoji</CommandItem>
                      <CommandItem>Calculator</CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Settings">
                      <CommandItem>Profile</CommandItem>
                      <CommandItem>Billing</CommandItem>
                      <CommandItem>Settings</CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              <CodeBlock
                code={`<Command className="rounded-lg border shadow-md">
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
    <CommandGroup heading="Settings">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Billing</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Hover Card */}
        <ComponentSection
          id="hover-card"
          title="Hover Card"
          description="Card that appears on hover"
          importCode={`import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/design-system/components/ui/hover-card'`}
          guidelines={["Use for previewing content without navigation", "Keep content concise"]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">@nextjs</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarFallback>NJ</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@nextjs</h4>
                        <p className="text-sm">
                          The React Framework – created and maintained by @vercel.
                        </p>
                        <div className="flex items-center pt-2">
                          <span className="text-muted-foreground text-xs">
                            Joined December 2021
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <CodeBlock
                code={`<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@nextjs</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex justify-between space-x-4">
      <Avatar>
        <AvatarFallback>NJ</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">@nextjs</h4>
        <p className="text-sm">
          The React Framework – created by @vercel.
        </p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Scroll Area */}
        <ComponentSection
          id="scroll-area"
          title="Scroll Area"
          description="Custom scrollable container"
          importCode={`import { ScrollArea } from '@/design-system/components/ui/scroll-area'`}
          guidelines={[
            "Use for custom scrollable content areas",
            "Provides consistent scroll behavior across platforms",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <ScrollArea className="h-72 w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="text-sm">
                        Item {i + 1} - This is scrollable content
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <CodeBlock
                code={`<ScrollArea className="h-72 w-full rounded-md border p-4">
  <div className="space-y-4">
    {items.map((item, i) => (
      <div key={i} className="text-sm">
        Item {i + 1} - This is scrollable content
      </div>
    ))}
  </div>
</ScrollArea>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Aspect Ratio */}
        <ComponentSection
          id="aspect-ratio"
          title="Aspect Ratio"
          description="Container that maintains aspect ratio"
          importCode={`import { AspectRatio } from '@/design-system/components/ui/aspect-ratio'`}
          guidelines={[
            "Use for images and videos that need consistent aspect ratios",
            "Common ratios: 16/9, 4/3, 1/1",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-background rounded-lg border p-6">
                <div className="w-[300px]">
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-md">
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      16:9 Aspect Ratio
                    </div>
                  </AspectRatio>
                </div>
              </div>
              <CodeBlock
                code={`<AspectRatio ratio={16 / 9} className="bg-muted">
  <img
    src="/image.jpg"
    alt="Photo"
    className="rounded-md object-cover"
  />
</AspectRatio>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* Form */}
        <ComponentSection
          id="form"
          title="Form"
          description="Form handling with React Hook Form and Zod validation"
          importCode={`import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/design-system/components/ui/form'`}
          guidelines={[
            "Use with React Hook Form for form state management",
            "Use Zod for schema validation",
            "Always include FormMessage for error display",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Example</h3>
            <div className="grid grid-cols-1 gap-6">
              <CodeBlock
                code={`const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Form submission handler - values available here
    void values;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}`}
              />
            </div>
          </div>
        </ComponentSection>
      </section>

      {/* Healthcare Dashboard Components Section */}
      <section id="dashboard-components" className="scroll-mt-8 space-y-16">
        <h2 className="text-4xl font-light tracking-tight text-black">Dashboard Components</h2>
        <p className="text-muted-foreground">
          Specialized components for healthcare dashboard interfaces with glassmorphism effects and
          responsive layouts.
        </p>

        {/* CardWrapper */}
        <ComponentSection
          id="card-wrapper"
          title="CardWrapper"
          description="A glassmorphism card container with backdrop blur and semi-transparent background"
          importCode={`import { CardWrapper } from '@/design-system/components/ui/card-wrapper'`}
          guidelines={[
            "Use for main content containers on dashboard pages",
            "Works well with the animated background",
            "Provides consistent glassmorphism styling",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <CardWrapper>
                  <Heading level={4}>Card Title</Heading>
                  <Text muted className="mt-2">
                    This is a glassmorphism card container with backdrop blur effects.
                  </Text>
                </CardWrapper>
              </div>
              <CodeBlock
                code={`<CardWrapper>
  <Heading level={4}>Card Title</Heading>
  <Text muted>Content goes here...</Text>
</CardWrapper>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* PriorityAction */}
        <ComponentSection
          id="priority-action"
          title="PriorityAction"
          description="A highlighted action card for urgent or priority items with avatar and call-to-action button"
          importCode={`import { PriorityAction } from '@/design-system/components/ui/priority-action'`}
          guidelines={[
            "Use for the most important action on the page",
            "Include a clear call-to-action button",
            "Avatar helps identify the related patient/person",
            "Limit to one per view to maintain focus",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <PriorityAction
                  title="Michael Chen is arriving"
                  subtitle="9:30 AM appointment • Room 101"
                  avatarInitials="MC"
                  buttonText="Begin Check-in"
                />
              </div>
              <CodeBlock
                code={`<PriorityAction
  title="Michael Chen is arriving"
  subtitle="9:30 AM appointment • Room 101"
  avatarInitials="MC"
  buttonText="Begin Check-in"
  onButtonClick={() => handleCheckin()}
/>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Custom Label</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <PriorityAction
                  label="Urgent Task"
                  title="Lab results require review"
                  subtitle="Patient: Sarah Johnson"
                  avatarInitials="SJ"
                  buttonText="Review Now"
                />
              </div>
              <CodeBlock
                code={`<PriorityAction
  label="Urgent Task"
  title="Lab results require review"
  subtitle="Patient: Sarah Johnson"
  avatarInitials="SJ"
  buttonText="Review Now"
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* AIActionCard */}
        <ComponentSection
          id="ai-action-card"
          title="AIActionCard"
          description="An AI-recommended action card featuring a large patient avatar, action details, status indicators, and badge variants. Uses solid white (100% opacity) background."
          importCode={`import { AIActionCard } from '@/design-system/components/ui/ai-action-card'`}
          guidelines={[
            "Use for AI substrate-recommended actions (Today's Actions)",
            "Uses solid white background (100% opacity) for maximum readability",
            "Large avatar emphasizes the patient focus",
            "Badge variants indicate action urgency/type",
            "Ready status shows preparation state",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Badge Variants</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="space-y-3">
                  <AIActionCard
                    patientName="Michael Chen"
                    avatarSrc="https://xsgames.co/randomusers/assets/avatars/male/32.jpg"
                    mainAction="A1C results available: 7.2% (↓ from 8.1%)"
                    statusIndicators="EXCELLENT PROGRESS ON TYPE 2 DIABETES MANAGEMENT"
                    readyStatus="Content ready"
                    suggestedActions={3}
                    badgeText="RESULTS READY"
                    badgeVariant="default"
                  />
                  <AIActionCard
                    patientName="Sarah Johnson"
                    avatarSrc="https://xsgames.co/randomusers/assets/avatars/female/1.jpg"
                    mainAction="9:00 AM Annual Physical"
                    statusIndicators="INSURANCE VERIFIED • 2 CARE GAPS IDENTIFIED"
                    readyStatus="Everything pre-configured"
                    suggestedActions={4}
                    badgeText="FIRST APPT TODAY"
                    badgeVariant="success"
                  />
                  <AIActionCard
                    patientName="Margaret Williams"
                    avatarSrc="https://xsgames.co/randomusers/assets/avatars/female/5.jpg"
                    mainAction="Metformin 500mg: 5 days remaining"
                    statusIndicators="SCHEDULED TODAY AT 10 AM • SAFETY CHECKS COMPLETE"
                    readyStatus="One-click approval"
                    badgeText="URGENT REFILL"
                    badgeVariant="urgent"
                  />
                </div>
              </div>
              <CodeBlock
                code={`<AIActionCard
  patientName="Michael Chen"
  avatarSrc="https://xsgames.co/randomusers/assets/avatars/male/32.jpg"
  mainAction="A1C results available: 7.2% (↓ from 8.1%)"
  statusIndicators="EXCELLENT PROGRESS ON TYPE 2 DIABETES MANAGEMENT"
  readyStatus="Content ready"
  suggestedActions={3}
  badgeText="RESULTS READY"
  badgeVariant="default"  // "default" | "success" | "warning" | "urgent"
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* PriorityActionCard */}
        <ComponentSection
          id="priority-action-card"
          title="PriorityActionCard"
          description="AI-surfaced priority action cards with color-coded urgency levels, action type icons, due dates, and confidence scores"
          importCode={`import { PriorityActionCard } from '@/design-system/components/ui/priority-action-card'`}
          guidelines={[
            "Use for AI substrate-surfaced priority actions on patient detail views",
            "Priority levels (urgent/high/medium/low) determine border and background colors",
            "Action types (risk/medication/care-gap/screening/followup/documentation) determine icons",
            "AI confidence scores help clinicians assess recommendation reliability",
            "Due dates provide actionable timeframes",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Priority Levels</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="space-y-3">
                  <PriorityActionCard
                    type="risk"
                    title="Elevated A1C Levels Detected"
                    description="Latest lab results show A1C at 7.8%. Consider diabetes management review."
                    priority="urgent"
                    dueDate="Immediate"
                    aiConfidence={94}
                  />
                  <PriorityActionCard
                    type="medication"
                    title="Medication Refill Due"
                    description="Metformin prescription expires in 5 days. Patient has 3-day supply remaining."
                    priority="high"
                    dueDate="Within 3 days"
                    aiConfidence={98}
                  />
                  <PriorityActionCard
                    type="care-gap"
                    title="Annual Wellness Visit Overdue"
                    description="Last comprehensive exam was 14 months ago. Schedule preventive care visit."
                    priority="medium"
                    dueDate="This month"
                    aiConfidence={87}
                  />
                  <PriorityActionCard
                    type="screening"
                    title="Depression Screening Recommended"
                    description="PHQ-9 indicated mild symptoms at last visit. Follow-up assessment suggested."
                    priority="low"
                    dueDate="Next visit"
                    aiConfidence={82}
                  />
                </div>
              </div>
              <CodeBlock
                code={`<PriorityActionCard
  type="risk"  // "risk" | "medication" | "care-gap" | "screening" | "followup" | "documentation"
  title="Elevated A1C Levels Detected"
  description="Latest lab results show A1C at 7.8%. Consider diabetes management review."
  priority="urgent"  // "urgent" | "high" | "medium" | "low"
  dueDate="Immediate"
  aiConfidence={94}
/>`}
              />
            </div>

            <h3 className="text-xl font-light text-black">Action Types</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">
                  Each action type has a distinct icon
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PriorityActionCard
                    type="risk"
                    title="Risk Alert"
                    description="AlertTriangle icon for clinical risks"
                    priority="urgent"
                  />
                  <PriorityActionCard
                    type="medication"
                    title="Medication Action"
                    description="Pill icon for medication-related tasks"
                    priority="high"
                  />
                  <PriorityActionCard
                    type="care-gap"
                    title="Care Gap"
                    description="Calendar icon for scheduling gaps"
                    priority="medium"
                  />
                  <PriorityActionCard
                    type="screening"
                    title="Screening"
                    description="TrendingUp icon for health screenings"
                    priority="medium"
                  />
                  <PriorityActionCard
                    type="followup"
                    title="Follow-up"
                    description="Clock icon for follow-up tasks"
                    priority="high"
                  />
                  <PriorityActionCard
                    type="documentation"
                    title="Documentation"
                    description="FileText icon for documentation tasks"
                    priority="low"
                  />
                </div>
              </div>
            </div>
          </div>
        </ComponentSection>

        {/* ActionRowCard */}
        <ComponentSection
          id="action-row-card"
          title="ActionRowCard"
          description="A compact row card for displaying appointment or action items with status badges"
          importCode={`import { ActionRowCard } from '@/design-system/components/ui/action-row-card'`}
          guidelines={[
            "Use in lists of appointments or tasks",
            "Status badge provides quick visual context",
            "Single-row horizontal layout for consistency",
            "Patient name and type truncate on smaller screens",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Status Variants</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="space-y-3">
                  <ActionRowCard
                    time="9:00 AM"
                    patient="Sarah Johnson"
                    type="ANNUAL PHYSICAL"
                    provider="Dr. Patel"
                    status="COMPLETED"
                    room="Room 101"
                  />
                  <ActionRowCard
                    time="9:30 AM"
                    patient="Michael Chen"
                    type="DIABETES FOLLOW-UP"
                    provider="Dr. Patel"
                    status="ARRIVED"
                    room="Room 101"
                  />
                  <ActionRowCard
                    time="9:45 AM"
                    patient="Emma Johnson"
                    type="SPORTS PHYSICAL"
                    provider="Dr. Chen"
                    status="ROOMED"
                    room="Room 103"
                  />
                  <ActionRowCard
                    time="10:00 AM"
                    patient="Emily Rodriguez"
                    type="PHYSICAL"
                    provider="Dr. Patel"
                    status="SCHEDULED"
                    room="Room 101"
                  />
                </div>
              </div>
              <CodeBlock
                code={`<ActionRowCard
  time="9:30 AM"
  patient="Michael Chen"
  type="DIABETES FOLLOW-UP"
  provider="Dr. Patel"
  status="ARRIVED"  // "SCHEDULED" | "ARRIVED" | "ROOMED" | "COMPLETED" | "CANCELED" | "RESCHEDULED"
  room="Room 101"
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* ScheduleRowCard */}
        <ComponentSection
          id="schedule-row-card"
          title="ScheduleRowCard"
          description="A compact row card for displaying schedule items with patient info, status badges, and room location. Uses transparent (50% opacity) background."
          importCode={`import { ScheduleRowCard } from '@/design-system/components/ui/schedule-row-card'`}
          guidelines={[
            "Use for Today's Patients schedule list on homepage",
            "Uses transparent background (50% opacity) for glassmorphism effect",
            "Status badge provides quick visual context",
            "Single-row horizontal layout for consistency",
            "Patient name and type truncate on smaller screens",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Status Variants</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="space-y-3">
                  <ScheduleRowCard
                    time="9:00 AM"
                    patient="Sarah Johnson"
                    type="ANNUAL PHYSICAL"
                    provider="Dr. Patel"
                    status="COMPLETED"
                    room="Room 101"
                  />
                  <ScheduleRowCard
                    time="9:30 AM"
                    patient="Michael Chen"
                    type="DIABETES FOLLOW-UP"
                    provider="Dr. Patel"
                    status="ARRIVED"
                    room="Room 101"
                  />
                  <ScheduleRowCard
                    time="9:45 AM"
                    patient="Emma Johnson"
                    type="SPORTS PHYSICAL"
                    provider="Dr. Chen"
                    status="ROOMED"
                    room="Room 103"
                  />
                  <ScheduleRowCard
                    time="10:00 AM"
                    patient="Emily Rodriguez"
                    type="PHYSICAL"
                    provider="Dr. Patel"
                    status="SCHEDULED"
                    room="Room 101"
                  />
                </div>
              </div>
              <CodeBlock
                code={`<ScheduleRowCard
  time="9:30 AM"
  patient="Michael Chen"
  type="DIABETES FOLLOW-UP"
  provider="Dr. Patel"
  status="ARRIVED"  // "SCHEDULED" | "ARRIVED" | "ROOMED" | "COMPLETED" | "CANCELED" | "RESCHEDULED"
  room="Room 101"
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* MessageRowCard */}
        <ComponentSection
          id="message-row-card"
          title="MessageRowCard"
          description="A compact message preview card for inbox-style lists"
          importCode={`import { MessageRowCard } from '@/design-system/components/ui/message-row-card'`}
          guidelines={[
            "Use in message lists or notification feeds",
            "Unread indicator draws attention to new items",
            "Text truncates to maintain consistent row height",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <div className="max-w-md space-y-3">
                  <MessageRowCard
                    name="Office: Appointment Request"
                    text="3 voicemails need follow-up"
                    time="5 MIN AGO"
                    unread={true}
                  />
                  <MessageRowCard
                    name="Sarah Johnson"
                    text="Need to reschedule Tuesday appointment"
                    time="12 MIN AGO"
                    unread={true}
                  />
                  <MessageRowCard
                    name="Lab: Quest Diagnostics"
                    text="Lab results ready for Patricia Moore"
                    time="1 HR AGO"
                    unread={false}
                  />
                </div>
              </div>
              <CodeBlock
                code={`<MessageRowCard
  name="Sarah Johnson"
  text="Need to reschedule Tuesday appointment"
  time="12 MIN AGO"
  unread={true}
/>`}
              />
            </div>
          </div>
        </ComponentSection>

        {/* OutstandingCard */}
        <ComponentSection
          id="outstanding-card"
          title="OutstandingCard"
          description="A summary card showing a count of outstanding items with a call-to-action"
          importCode={`import { OutstandingCard } from '@/design-system/components/ui/outstanding-card'`}
          guidelines={[
            "Use to highlight items requiring attention",
            "Large count number draws focus",
            "Customizable icon for different item types",
          ]}
        >
          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Basic Usage</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <OutstandingCard count={14} subtitle="Needs attention by 5 PM" />
              </div>
              <CodeBlock
                code={`<OutstandingCard
  count={14}
  subtitle="Needs attention by 5 PM"
/>`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-light text-black">Custom Icon & Title</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-muted-foreground mb-4 text-sm">Preview</p>
                <OutstandingCard
                  title="Pending Documents"
                  count={7}
                  subtitle="Review required"
                  buttonText="Review All"
                  icon={FileText}
                />
              </div>
              <CodeBlock
                code={`import { FileText } from "lucide-react"

<OutstandingCard
  title="Pending Documents"
  count={7}
  subtitle="Review required"
  buttonText="Review All"
  icon={FileText}
/>`}
              />
            </div>
          </div>
        </ComponentSection>
      </section>

      {/* Usage Guidelines Section */}
      <section id="usage-guidelines" className="scroll-mt-8 space-y-8">
        <h2 className="text-4xl font-light tracking-tight text-black">Usage Guidelines</h2>

        <Card>
          <CardHeader>
            <CardTitle>Design Principles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-light text-black">Consistency</h4>
              <p className="text-muted-foreground">
                Always use design tokens instead of hard-coded values. This ensures consistency
                across the application and makes global changes easy.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-light text-black">Accessibility</h4>
              <p className="text-muted-foreground">
                All components follow WAI-ARIA guidelines. Always use proper labels, maintain color
                contrast, and ensure keyboard navigation works.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-light text-black">Responsiveness</h4>
              <p className="text-muted-foreground">
                Components are designed to work across all screen sizes. Use the provided spacing
                and layout utilities for responsive designs.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`// Always import from the design system
import { Button } from '@/design-system/components/ui/button'

// Use design tokens via CSS variables
className="text-foreground bg-background"

// Or access via Tailwind classes that map to tokens
className="text-primary hover:text-primary/90"`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To customize the design system, edit the CSS variables in{" "}
              <code className="bg-muted rounded px-1.5 py-0.5">
                /design-system/styles/globals.css
              </code>
              .
            </p>
            <CodeBlock
              code={`:root {
  --primary: oklch(0.6790 0.1311 36.0386);
  --primary-foreground: oklch(1.0000 0 0);

  /* Change these values to customize the theme */
  --radius: 1.525rem;
  --font-sans: "Akkurat LL", system-ui, sans-serif;
}`}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
