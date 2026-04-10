import { redirect } from 'next/navigation'

// /curalog → send visitors to the CuraLog login page
export default function CuraLogEntry() {
  redirect('/login')
}
