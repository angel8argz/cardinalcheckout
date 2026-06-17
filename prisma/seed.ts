import { PrismaClient, ItemStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Synthetic data only. Never use real student records (FERPA).

const now = new Date();

function addDays(days: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
}

// A fixed time today, used for the "due today" loans.
function todayAt(hour: number, minute = 0): Date {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Wipe in dependency order so re-running the seed is idempotent.
  await prisma.loan.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.item.deleteMany();
  await prisma.patron.deleteMany();
  await prisma.category.deleteMany();

  // Categories, each with a circulation policy (loan period + fine rule).
  const categorySpecs = [
    { name: "Laptops", loanPeriodDays: 7, finePerDay: 5 },
    { name: "Cameras", loanPeriodDays: 3, finePerDay: 10 },
    { name: "Cables", loanPeriodDays: 14, finePerDay: 1 },
    { name: "Audio Gear", loanPeriodDays: 5, finePerDay: 5 },
    { name: "Accessories", loanPeriodDays: 14, finePerDay: 1 },
  ];

  const categories: Record<string, number> = {};
  for (const spec of categorySpecs) {
    const category = await prisma.category.create({
      data: {
        name: spec.name,
        policy: {
          create: {
            loanPeriodDays: spec.loanPeriodDays,
            finePerDay: spec.finePerDay,
          },
        },
      },
    });
    categories[spec.name] = category.id;
  }

  // ~15 items across the categories.
  const itemSpecs: {
    name: string;
    barcode: string;
    category: string;
    serialNumber?: string;
    conditionNotes?: string;
    status?: ItemStatus;
  }[] = [
    { name: 'MacBook Pro 14" #1', barcode: "WC-100001", category: "Laptops", serialNumber: "C02XL1ABCDEF" },
    { name: 'MacBook Pro 14" #2', barcode: "WC-100002", category: "Laptops", serialNumber: "C02XL2GHIJKL" },
    { name: "Dell XPS 13", barcode: "WC-100003", category: "Laptops", serialNumber: "DXPS13-77421" },
    { name: "iPad Air", barcode: "WC-100004", category: "Laptops", serialNumber: "DMPXIPAD0091" },
    { name: "Canon EOS R6", barcode: "WC-200001", category: "Cameras", serialNumber: "CN-R6-558712" },
    { name: "Sony A7 III", barcode: "WC-200002", category: "Cameras", serialNumber: "SNY-A7-33120", conditionNotes: "Minor scuff on grip." },
    { name: "Canon RF 24-70mm Lens", barcode: "WC-200003", category: "Cameras", serialNumber: "RF2470-00984" },
    { name: "Manfrotto Tripod", barcode: "WC-200004", category: "Cameras" },
    { name: "HDMI Cable 6ft", barcode: "WC-300001", category: "Cables" },
    { name: "USB-C to USB-C Cable", barcode: "WC-300002", category: "Cables" },
    { name: "Zoom H6 Recorder", barcode: "WC-400001", category: "Audio Gear", serialNumber: "ZMH6-119087" },
    { name: "Sony WH-1000XM4 Headphones", barcode: "WC-400002", category: "Audio Gear", serialNumber: "WH1000-44290" },
    { name: "Shure SM58 Microphone", barcode: "WC-400003", category: "Audio Gear", status: ItemStatus.MAINTENANCE, conditionNotes: "Intermittent cable; in repair." },
    { name: "USB-C Power Adapter 96W", barcode: "WC-500001", category: "Accessories" },
    { name: "Logitech Presentation Remote", barcode: "WC-500002", category: "Accessories", status: ItemStatus.LOST, conditionNotes: "Not returned from a prior loan; presumed lost." },
  ];

  const items: Record<string, number> = {};
  for (const spec of itemSpecs) {
    const item = await prisma.item.create({
      data: {
        name: spec.name,
        barcode: spec.barcode,
        categoryId: categories[spec.category],
        serialNumber: spec.serialNumber ?? null,
        conditionNotes: spec.conditionNotes ?? null,
        status: spec.status ?? ItemStatus.AVAILABLE,
      },
    });
    items[spec.barcode] = item.id;
  }

  // ~6 patrons with SUNet-style IDs.
  const patronSpecs = [
    { sunetId: "jdoe", firstName: "Jordan", lastName: "Doe", email: "jdoe@stanford.edu" },
    { sunetId: "asmith24", firstName: "Avery", lastName: "Smith", email: "asmith24@stanford.edu" },
    { sunetId: "mlee", firstName: "Morgan", lastName: "Lee", email: "mlee@stanford.edu" },
    { sunetId: "kpatel", firstName: "Kiran", lastName: "Patel", email: "kpatel@stanford.edu" },
    { sunetId: "rgomez", firstName: "Riley", lastName: "Gomez", email: "rgomez@stanford.edu" },
    { sunetId: "bchen", firstName: "Bailey", lastName: "Chen", email: "bchen@stanford.edu" },
  ];

  const patrons: Record<string, number> = {};
  for (const spec of patronSpecs) {
    const patron = await prisma.patron.create({ data: spec });
    patrons[spec.sunetId] = patron.id;
  }

  // Loans: a mix of overdue, due today, on time, and returned.
  // checkoutAt is derived from the category loan period for realism.
  const loanSpecs: {
    barcode: string;
    sunetId: string;
    dueAt: Date;
    loanPeriodDays: number;
    returnedAt?: Date;
    staffName: string;
  }[] = [
    // Overdue.
    { barcode: "WC-100001", sunetId: "jdoe", dueAt: addDays(-3), loanPeriodDays: 7, staffName: "Alex Rivera" },
    { barcode: "WC-200001", sunetId: "asmith24", dueAt: addDays(-1), loanPeriodDays: 3, staffName: "Sam Okafor" },
    // Due today.
    { barcode: "WC-400001", sunetId: "mlee", dueAt: todayAt(17, 0), loanPeriodDays: 5, staffName: "Alex Rivera" },
    { barcode: "WC-200004", sunetId: "kpatel", dueAt: todayAt(19, 30), loanPeriodDays: 3, staffName: "Dana Cruz" },
    // On time.
    { barcode: "WC-100004", sunetId: "jdoe", dueAt: addDays(5), loanPeriodDays: 7, staffName: "Sam Okafor" },
    { barcode: "WC-300001", sunetId: "rgomez", dueAt: addDays(10), loanPeriodDays: 14, staffName: "Dana Cruz" },
    { barcode: "WC-400002", sunetId: "bchen", dueAt: addDays(2), loanPeriodDays: 5, staffName: "Alex Rivera" },
    // Returned (historical).
    { barcode: "WC-200003", sunetId: "mlee", dueAt: addDays(-7), loanPeriodDays: 3, returnedAt: addDays(-5), staffName: "Sam Okafor" },
  ];

  for (const spec of loanSpecs) {
    const checkoutAt = new Date(spec.dueAt);
    checkoutAt.setDate(checkoutAt.getDate() - spec.loanPeriodDays);
    await prisma.loan.create({
      data: {
        itemId: items[spec.barcode],
        patronId: patrons[spec.sunetId],
        checkoutAt,
        dueAt: spec.dueAt,
        returnedAt: spec.returnedAt ?? null,
        staffName: spec.staffName,
      },
    });

    // Items with an active (unreturned) loan are checked out.
    if (!spec.returnedAt) {
      await prisma.item.update({
        where: { id: items[spec.barcode] },
        data: { status: ItemStatus.CHECKED_OUT },
      });
    }
  }

  const counts = {
    categories: await prisma.category.count(),
    items: await prisma.item.count(),
    patrons: await prisma.patron.count(),
    loans: await prisma.loan.count(),
    activeLoans: await prisma.loan.count({ where: { returnedAt: null } }),
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
