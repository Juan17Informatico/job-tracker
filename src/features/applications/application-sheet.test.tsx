import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/app/app'
import { useAppStore } from '@/store/use-app-store'
beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({
    applications: [],
    settings: { theme: 'light', language: 'en' },
    storageError: null,
  })
})
describe('opportunity workflow', () => {
  it('validates, creates with tags, edits, filters, and confirms deletion', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Add your first opportunity' }))
    await user.click(screen.getByRole('button', { name: 'Add opportunity' }))
    expect(await screen.findByText('Company is required')).toBeVisible()
    await user.type(screen.getByLabelText('Company *'), 'Acme')
    await user.type(screen.getByLabelText('Position *'), 'Frontend Engineer')
    await user.type(screen.getByLabelText('Technologies'), 'React{Enter}TypeScript{Enter}')
    await user.click(screen.getByRole('button', { name: 'Add opportunity' }))
    expect(await screen.findByRole('button', { name: 'Frontend Engineer' })).toBeVisible()
    expect(useAppStore.getState().applications[0].technologies).toEqual(['React', 'TypeScript'])
    expect(useAppStore.getState().applications[0].salaryMin).toBeNull()
    expect(useAppStore.getState().applications[0].salaryMax).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Edit Acme opportunity' }))
    await user.clear(screen.getByLabelText('Position *'))
    await user.type(screen.getByLabelText('Position *'), 'Senior Engineer')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByRole('button', { name: 'Senior Engineer' })).toBeVisible()
    await user.selectOptions(screen.getByLabelText('Status for Acme Senior Engineer'), 'interview')
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'rejected')
    expect(screen.getByText('No matching opportunities')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    await user.click(screen.getByRole('button', { name: 'Delete Acme opportunity' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(useAppStore.getState().applications).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Delete Acme opportunity' }))
    await user.click(screen.getByRole('button', { name: 'Delete opportunity' }))
    await waitFor(() => expect(useAppStore.getState().applications).toHaveLength(0))
  })
})
