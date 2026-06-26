import { PrismaClient, ResourceStatus, AllocationStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Synthetic data only. Never use real student records (FERPA).

const now = new Date();

function addDays(days: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
}

// A fixed time today, used for the "due today" allocations.
function todayAt(hour: number, minute = 0): Date {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Wipe in dependency order so re-running the seed is idempotent.
  await prisma.allocationLineItem.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.authorization.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.resourceType.deleteMany();
  await prisma.patron.deleteMany();
  await prisma.patronGroup.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organization.deleteMany();

  // One organization, the tech desk, with a couple of departments.
  const org = await prisma.organization.create({
    data: { name: "Stanford University" },
  });

  const deptSpecs = ["Lathrop Tech Desk", "Media & Production"];
  const departments: Record<string, number> = {};
  for (const name of deptSpecs) {
    const dept = await prisma.department.create({
      data: { name, organizationId: org.id },
    });
    departments[name] = dept.id;
  }

  // Resource types carry the circulation policy (loan period + fine rule).
  const typeSpecs = [
    { name: "Laptops", loanPeriodDays: 7, finePerDay: 5 },
    { name: "Cameras", loanPeriodDays: 3, finePerDay: 10 },
    { name: "Cables", loanPeriodDays: 14, finePerDay: 1 },
    { name: "Audio Gear", loanPeriodDays: 5, finePerDay: 5 },
    { name: "Accessories", loanPeriodDays: 14, finePerDay: 1 },
  ];

  const types: Record<string, number> = {};
  for (const spec of typeSpecs) {
    const type = await prisma.resourceType.create({ data: spec });
    types[spec.name] = type.id;
  }

  // A bundle: a camera kit circulated as a single unit.
  const cameraKit = await prisma.bundle.create({
    data: { name: "Documentary Camera Kit", barcode: "WC-BUNDLE-0001" },
  });

  // ~15 resources across the types.
  const resourceSpecs: {
    name: string;
    barcode: string;
    type: string;
    department?: string;
    bundle?: number;
    serialNumber?: string;
    conditionNotes?: string;
    status?: ResourceStatus;
  }[] = [
    { name: 'MacBook Pro 14" #1', barcode: "WC-100001", type: "Laptops", department: "Lathrop Tech Desk", serialNumber: "C02XL1ABCDEF" },
    { name: 'MacBook Pro 14" #2', barcode: "WC-100002", type: "Laptops", department: "Lathrop Tech Desk", serialNumber: "C02XL2GHIJKL" },
    { name: "Dell XPS 13", barcode: "WC-100003", type: "Laptops", department: "Lathrop Tech Desk", serialNumber: "DXPS13-77421" },
    { name: "iPad Air", barcode: "WC-100004", type: "Laptops", department: "Lathrop Tech Desk", serialNumber: "DMPXIPAD0091" },
    { name: "Canon EOS R6", barcode: "WC-200001", type: "Cameras", department: "Media & Production", bundle: cameraKit.id, serialNumber: "CN-R6-558712" },
    { name: "Sony A7 III", barcode: "WC-200002", type: "Cameras", department: "Media & Production", serialNumber: "SNY-A7-33120", conditionNotes: "Minor scuff on grip." },
    { name: "Canon RF 24-70mm Lens", barcode: "WC-200003", type: "Cameras", department: "Media & Production", bundle: cameraKit.id, serialNumber: "RF2470-00984" },
    { name: "Manfrotto Tripod", barcode: "WC-200004", type: "Cameras", department: "Media & Production", bundle: cameraKit.id },
    { name: "HDMI Cable 6ft", barcode: "WC-300001", type: "Cables", department: "Lathrop Tech Desk" },
    { name: "USB-C to USB-C Cable", barcode: "WC-300002", type: "Cables", department: "Lathrop Tech Desk" },
    { name: "Zoom H6 Recorder", barcode: "WC-400001", type: "Audio Gear", department: "Media & Production", serialNumber: "ZMH6-119087" },
    { name: "Sony WH-1000XM4 Headphones", barcode: "WC-400002", type: "Audio Gear", department: "Lathrop Tech Desk", serialNumber: "WH1000-44290" },
    { name: "Shure SM58 Microphone", barcode: "WC-400003", type: "Audio Gear", department: "Media & Production", status: ResourceStatus.MAINTENANCE, conditionNotes: "Intermittent cable; in repair." },
    { name: "USB-C Power Adapter 96W", barcode: "WC-500001", type: "Accessories", department: "Lathrop Tech Desk" },
    { name: "Logitech Presentation Remote", barcode: "WC-500002", type: "Accessories", department: "Lathrop Tech Desk", status: ResourceStatus.LOST, conditionNotes: "Not returned from a prior allocation; presumed lost." },
  ];

  const resources: Record<string, number> = {};
  for (const spec of resourceSpecs) {
    const resource = await prisma.resource.create({
      data: {
        name: spec.name,
        barcode: spec.barcode,
        resourceTypeId: types[spec.type],
        departmentId: spec.department ? departments[spec.department] : null,
        bundleId: spec.bundle ?? null,
        serialNumber: spec.serialNumber ?? null,
        conditionNotes: spec.conditionNotes ?? null,
        status: spec.status ?? ResourceStatus.AVAILABLE,
      },
    });
    resources[spec.barcode] = resource.id;
  }

  // Patron groups drive authorizations.
  const groupSpecs = ["Students", "Faculty", "Staff"];
  const groups: Record<string, number> = {};
  for (const name of groupSpecs) {
    const group = await prisma.patronGroup.create({ data: { name } });
    groups[name] = group.id;
  }

  // Authorization matrix: which group may borrow which type, with caps.
  const authSpecs: {
    group: string;
    type: string;
    maxDurationDays?: number;
    maxQuantity?: number;
  }[] = [
    { group: "Students", type: "Laptops", maxDurationDays: 7, maxQuantity: 1 },
    { group: "Students", type: "Cables", maxDurationDays: 14, maxQuantity: 4 },
    { group: "Students", type: "Accessories", maxDurationDays: 14, maxQuantity: 4 },
    { group: "Faculty", type: "Cameras", maxDurationDays: 7, maxQuantity: 2 },
    { group: "Faculty", type: "Audio Gear", maxDurationDays: 7, maxQuantity: 2 },
    { group: "Staff", type: "Laptops", maxDurationDays: 14, maxQuantity: 3 },
  ];

  for (const spec of authSpecs) {
    await prisma.authorization.create({
      data: {
        patronGroupId: groups[spec.group],
        resourceTypeId: types[spec.type],
        maxDurationDays: spec.maxDurationDays ?? null,
        maxQuantity: spec.maxQuantity ?? null,
      },
    });
  }

  // ~6 patrons with SUNet-style IDs.
  const patronSpecs = [
    { sunetId: "jdoe", firstName: "Jordan", lastName: "Doe", email: "jdoe@stanford.edu", group: "Students", department: "Lathrop Tech Desk" },
    { sunetId: "asmith24", firstName: "Avery", lastName: "Smith", email: "asmith24@stanford.edu", group: "Students", department: "Lathrop Tech Desk" },
    { sunetId: "mlee", firstName: "Morgan", lastName: "Lee", email: "mlee@stanford.edu", group: "Faculty", department: "Media & Production" },
    { sunetId: "kpatel", firstName: "Kiran", lastName: "Patel", email: "kpatel@stanford.edu", group: "Faculty", department: "Media & Production" },
    { sunetId: "rgomez", firstName: "Riley", lastName: "Gomez", email: "rgomez@stanford.edu", group: "Students", department: "Lathrop Tech Desk" },
    { sunetId: "bchen", firstName: "Bailey", lastName: "Chen", email: "bchen@stanford.edu", group: "Staff", department: "Lathrop Tech Desk" },
  ];

  const patrons: Record<string, number> = {};
  for (const spec of patronSpecs) {
    const patron = await prisma.patron.create({
      data: {
        sunetId: spec.sunetId,
        firstName: spec.firstName,
        lastName: spec.lastName,
        email: spec.email,
        patronGroupId: groups[spec.group],
        departmentId: departments[spec.department],
        organizationId: org.id,
      },
    });
    patrons[spec.sunetId] = patron.id;
  }

  // Operators process allocations (no auth in the MVP; these are records).
  const operatorSpecs = [
    { name: "Alex Rivera", email: "arivera@stanford.edu", department: "Lathrop Tech Desk" },
    { name: "Sam Okafor", email: "sokafor@stanford.edu", department: "Lathrop Tech Desk" },
    { name: "Dana Cruz", email: "dcruz@stanford.edu", department: "Media & Production" },
  ];

  const operators: Record<string, number> = {};
  for (const spec of operatorSpecs) {
    const operator = await prisma.operator.create({
      data: {
        name: spec.name,
        email: spec.email,
        departmentId: departments[spec.department],
        organizationId: org.id,
      },
    });
    operators[spec.name] = operator.id;
  }

  // Allocations: a mix of overdue, due today, on time, and returned.
  // Each carries one or more resource line items. scheduledStart is derived
  // from the type loan period for realism.
  const allocationSpecs: {
    sunetId: string;
    operator: string;
    barcodes: string[];
    scheduledEnd: Date;
    loanPeriodDays: number;
    returned?: boolean;
    cancelled?: boolean;
  }[] = [
    // Overdue.
    { sunetId: "jdoe", operator: "Alex Rivera", barcodes: ["WC-100001"], scheduledEnd: addDays(-3), loanPeriodDays: 7 },
    { sunetId: "asmith24", operator: "Sam Okafor", barcodes: ["WC-200002"], scheduledEnd: addDays(-1), loanPeriodDays: 3 },
    // Due today.
    { sunetId: "mlee", operator: "Alex Rivera", barcodes: ["WC-400001"], scheduledEnd: todayAt(17, 0), loanPeriodDays: 5 },
    { sunetId: "kpatel", operator: "Dana Cruz", barcodes: ["WC-200001", "WC-200003", "WC-200004"], scheduledEnd: todayAt(19, 30), loanPeriodDays: 3 },
    // On time.
    { sunetId: "jdoe", operator: "Sam Okafor", barcodes: ["WC-100004"], scheduledEnd: addDays(5), loanPeriodDays: 7 },
    { sunetId: "rgomez", operator: "Dana Cruz", barcodes: ["WC-300001"], scheduledEnd: addDays(10), loanPeriodDays: 14 },
    { sunetId: "bchen", operator: "Alex Rivera", barcodes: ["WC-400002"], scheduledEnd: addDays(2), loanPeriodDays: 5 },
    // Returned (historical).
    { sunetId: "mlee", operator: "Sam Okafor", barcodes: ["WC-300002"], scheduledEnd: addDays(-7), loanPeriodDays: 3, returned: true },
  ];

  for (const spec of allocationSpecs) {
    const scheduledStart = new Date(spec.scheduledEnd);
    scheduledStart.setDate(scheduledStart.getDate() - spec.loanPeriodDays);

    const returned = spec.returned ?? false;
    const cancelled = spec.cancelled ?? false;
    const status = cancelled
      ? AllocationStatus.CANCELLED
      : returned
        ? AllocationStatus.RETURNED
        : AllocationStatus.CHECKED_OUT;

    // Returned allocations came back two days before they were due.
    const actualEnd = returned ? addDays(-5) : null;
    const actualStart = cancelled ? null : scheduledStart;

    await prisma.allocation.create({
      data: {
        patronId: patrons[spec.sunetId],
        operatorId: operators[spec.operator],
        status,
        scheduledStart,
        scheduledEnd: spec.scheduledEnd,
        actualStart,
        actualEnd,
        lineItems: {
          create: spec.barcodes.map((barcode) => ({
            resourceId: resources[barcode],
            returnedAt: returned ? actualEnd : null,
          })),
        },
      },
    });

    // Resources on an active (checked-out) allocation are marked checked out.
    if (status === AllocationStatus.CHECKED_OUT) {
      for (const barcode of spec.barcodes) {
        await prisma.resource.update({
          where: { id: resources[barcode] },
          data: { status: ResourceStatus.CHECKED_OUT },
        });
      }
    }
  }

  const counts = {
    organizations: await prisma.organization.count(),
    departments: await prisma.department.count(),
    resourceTypes: await prisma.resourceType.count(),
    bundles: await prisma.bundle.count(),
    resources: await prisma.resource.count(),
    patronGroups: await prisma.patronGroup.count(),
    patrons: await prisma.patron.count(),
    operators: await prisma.operator.count(),
    authorizations: await prisma.authorization.count(),
    allocations: await prisma.allocation.count(),
    activeAllocations: await prisma.allocation.count({
      where: { status: AllocationStatus.CHECKED_OUT },
    }),
  };
  console.log("Seed complete:", counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
