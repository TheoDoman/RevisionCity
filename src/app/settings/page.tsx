'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { AlertTriangle, Trash2, User, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const canDelete = confirmText === 'DELETE'

  const handleDelete = async () => {
    if (!canDelete || deleting) return

    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch('/api/delete-account', { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        setDeleteError(data.error ?? 'An unexpected error occurred. Please try again.')
        setDeleting(false)
        return
      }

      // Sign out and redirect to home — auth account is now deleted
      await signOut()
      router.push('/?deleted=true')
    } catch {
      setDeleteError('Failed to reach the server. Please check your connection and try again.')
      setDeleting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const email = user.primaryEmailAddress?.emailAddress ?? '—'
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—'

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-2xl font-bold text-brand-950">Account Settings</h1>
          <p className="text-brand-600 text-sm mt-1">Manage your account and personal data</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Account info */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6">
          <h2 className="font-display text-base font-semibold text-brand-900 mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-brand-500" />
            Account Information
          </h2>
          <dl className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <dt className="w-16 shrink-0 text-brand-500">Name</dt>
              <dd className="text-brand-900 font-medium">{name}</dd>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <dt className="w-16 shrink-0 text-brand-500">Email</dt>
              <dd className="flex items-center gap-1.5 text-brand-900 font-medium">
                <Mail className="h-3.5 w-3.5 text-brand-400" />
                {email}
              </dd>
            </div>
          </dl>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-6">
          <h2 className="font-display text-base font-semibold text-brand-900 mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-500" />
            Privacy &amp; Data
          </h2>
          <p className="text-sm text-brand-600">
            We store your study activity, quiz results, and revision plans.
            You have the right to request deletion of all personal data under GDPR.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-6">
          <h2 className="font-display text-base font-semibold text-red-700 mb-1 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </h2>
          <p className="text-sm text-brand-600 mb-4">
            Permanently deletes your account and all associated data — activity history, quiz results,
            and revision plans.
            <strong className="text-brand-900"> This cannot be undone.</strong>
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete my account
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-brand-900">
                  Permanently delete account?
                </h3>
                <p className="text-sm text-brand-600 mt-1">
                  This will immediately and permanently delete:
                </p>
              </div>
            </div>

            <ul className="mb-5 space-y-1 text-sm text-brand-700 ml-13 pl-2">
              <li className="flex items-center gap-2 before:content-['•'] before:text-red-400 before:font-bold">All study activity and quiz results</li>
              <li className="flex items-center gap-2 before:content-['•'] before:text-red-400 before:font-bold">Revision plans</li>
              <li className="flex items-center gap-2 before:content-['•'] before:text-red-400 before:font-bold">Your account login</li>
            </ul>

            <label className="block text-sm font-medium text-brand-700 mb-1.5">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
              className="w-full border-2 border-brand-200 focus:border-red-400 rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-colors mb-4"
            />

            {deleteError && (
              <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setConfirmText(''); setDeleteError(null) }}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border-2 border-brand-200 text-brand-700 text-sm font-medium rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete everything
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
