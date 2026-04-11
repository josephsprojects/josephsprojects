export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest) {
  const user = await requireOwner()

  // Wipe existing test data first
  const existing = await prisma.workspace.findFirst({ where: { is_test: true } })
  if (existing) {
    await prisma.workspace.delete({ where: { id: existing.id } })
  }

  // Create test workspace
  const ws = await prisma.workspace.create({
    data: {
      name: 'Demo Family',
      type: 'family',
      description: 'Auto-generated demo workspace for testing',
      is_test: true,
      status: 'active',
    }
  })

  // Seed patients
  const patients = await Promise.all([
    prisma.patient.create({ data: { workspace_id: ws.id, name: 'Alex Rivera', dob: '1985-03-14', relationship: 'Self', phone: '+15555550101', email: 'alex@example.com', allergies: 'Penicillin, Sulfa drugs', color: '#0E4F54', initials: 'AR' } }),
    prisma.patient.create({ data: { workspace_id: ws.id, name: 'Maria Rivera', dob: '1987-07-22', relationship: 'Spouse', phone: '+15555550102', email: 'maria@example.com', allergies: 'None known', color: '#5B3BA8', initials: 'MR' } }),
    prisma.patient.create({ data: { workspace_id: ws.id, name: 'Sam Rivera', dob: '2012-11-05', relationship: 'Child', allergies: 'Latex', color: '#C9762A', initials: 'SR' } }),
  ])

  const [alex, maria, sam] = patients

  const today = new Date().toISOString().split('T')[0]
  const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }

  // Alex's medications
  await Promise.all([
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: alex.id, name: 'Adderall XR', brand: 'Adderall XR', generic: 'Amphetamine Aspartate / Amphetamine Sulfate / Dextroamphetamine Saccharate / Dextroamphetamine Sulfate', type: 'medication', form: 'Extended-Release Capsule', dosage: '20 MG', frequency: 'Once daily (QD)', purpose: 'ADHD', status: 'active', quantity: 30, days_supply: 30, quantity_home: 8, pickup_date: daysAgo(22), last_fill: daysAgo(22), refills: 2, notify_refill: true, instructions: 'Take in the morning' } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: alex.id, name: 'Lisinopril', generic: 'Lisinopril', type: 'medication', form: 'Tablet', dosage: '10 MG', frequency: 'Once daily (QD)', purpose: 'Hypertension', status: 'active', quantity: 90, days_supply: 90, quantity_home: 61, pickup_date: daysAgo(29), last_fill: daysAgo(29), refills: 5, notify_refill: true } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: alex.id, name: 'Quviviq', brand: 'Quviviq', generic: 'Daridorexant', type: 'medication', form: 'Tablet', dosage: '25 MG', frequency: 'At bedtime (QHS)', purpose: 'Insomnia', status: 'on_hold', quantity: 30, days_supply: 30, refills: 0, notify_refill: true, instructions: 'Take within 30 min of bedtime, only when you have at least 7 hours to sleep' } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: alex.id, name: 'Magnesium Glycinate', type: 'supplement', form: 'Capsule', dosage: '400 MG', frequency: 'Once daily', purpose: 'Sleep support, muscle recovery', status: 'active', quantity: 60, days_supply: 60, quantity_home: 34, pickup_date: daysAgo(26), last_fill: daysAgo(26), refills: 0, notify_refill: false } }),
  ])

  // Maria's medications
  await Promise.all([
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: maria.id, name: 'Metformin', generic: 'Metformin Hydrochloride', type: 'medication', form: 'Tablet', dosage: '500 MG', frequency: 'Twice daily (BID)', purpose: 'Type 2 Diabetes', status: 'active', quantity: 60, days_supply: 30, quantity_home: 4, pickup_date: daysAgo(28), last_fill: daysAgo(28), refills: 11, notify_refill: true, instructions: 'Take with meals to reduce GI upset' } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: maria.id, name: 'Sertraline', brand: 'Zoloft', generic: 'Sertraline Hydrochloride', type: 'medication', form: 'Tablet', dosage: '50 MG', frequency: 'Once daily (QD)', purpose: 'Depression / Anxiety', status: 'active', quantity: 30, days_supply: 30, quantity_home: 16, pickup_date: daysAgo(14), last_fill: daysAgo(14), refills: 3, notify_refill: true } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: maria.id, name: 'Vitamin D3', type: 'supplement', form: 'Softgel', dosage: '2000 IU', frequency: 'Once daily', purpose: 'Bone health, immune support', status: 'active', quantity: 90, days_supply: 90, quantity_home: 72, pickup_date: daysAgo(18), last_fill: daysAgo(18), refills: 0, notify_refill: false } }),
  ])

  // Sam's medications
  await Promise.all([
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: sam.id, name: 'Albuterol', brand: 'ProAir HFA', generic: 'Albuterol Sulfate', type: 'medication', form: 'Inhaler', dosage: '90 MCG', frequency: 'As needed (PRN)', purpose: 'Asthma / Bronchospasm', status: 'active', quantity: 1, days_supply: 90, quantity_home: 1, pickup_date: daysAgo(5), last_fill: daysAgo(5), refills: 2, notify_refill: true, instructions: 'Use 1-2 puffs every 4-6 hours as needed. Shake well before use.' } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: sam.id, name: 'Montelukast', brand: 'Singulair', generic: 'Montelukast Sodium', type: 'medication', form: 'Chewable Tablet', dosage: '5 MG', frequency: 'Once daily (QD)', purpose: 'Asthma prevention, Allergies', status: 'active', quantity: 30, days_supply: 30, quantity_home: 2, pickup_date: daysAgo(28), last_fill: daysAgo(28), refills: 4, notify_refill: true, instructions: 'Take in the evening' } }),
    prisma.medication.create({ data: { workspace_id: ws.id, patient_id: sam.id, name: 'Omega-3 Fish Oil', type: 'supplement', form: 'Softgel', dosage: '1000 MG', frequency: 'Once daily', purpose: 'Heart health, brain development', status: 'active', quantity: 90, days_supply: 90, quantity_home: 55, pickup_date: daysAgo(35), last_fill: daysAgo(35), refills: 0, notify_refill: false } }),
  ])

  return NextResponse.json<ApiResponse>({ success: true, message: 'Test data seeded' })
}

export async function DELETE(req: NextRequest) {
  await requireOwner()
  const ws = await prisma.workspace.findFirst({ where: { is_test: true } })
  if (ws) await prisma.workspace.delete({ where: { id: ws.id } })
  return NextResponse.json<ApiResponse>({ success: true, message: 'Test data cleared' })
}
