import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ensureCsrfCookie } from './api'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/user')
      return data
    },
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, password }) => {
      await ensureCsrfCookie()
      const { data } = await api.post('/login', { email, password })
      return data.user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post('/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null)
    },
  })
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => (await api.get('/dashboard/summary')).data,
  })
}

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => (await api.get('/patients')).data,
  })
}

export function usePatient(id) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => (await api.get(`/patients/${id}`)).data,
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => (await api.post('/patients', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useCreateProgram(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/patients/${patientId}/programs`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', String(patientId)] })
    },
  })
}

export function useUpdateProgram(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.patch(`/programs/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', String(patientId)] })
    },
  })
}

export function useCreateReminder(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ programId, ...payload }) =>
      (await api.post(`/programs/${programId}/reminders`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', String(patientId)] })
    },
  })
}

export function useDeleteReminder(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => api.delete(`/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', String(patientId)] })
    },
  })
}

export function useFlaggedCheckIns() {
  return useQuery({
    queryKey: ['check-ins', 'flagged'],
    queryFn: async () => (await api.get('/check-ins', { params: { flagged: 'true' } })).data,
  })
}

export function useCheckIns() {
  return useQuery({
    queryKey: ['check-ins', 'all'],
    queryFn: async () => (await api.get('/check-ins')).data,
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => (await api.get('/dashboard/analytics')).data,
  })
}

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => (await api.get('/reminders')).data,
  })
}
