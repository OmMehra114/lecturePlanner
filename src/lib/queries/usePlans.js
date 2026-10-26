'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Fetch all lecture plans saved by the authenticated user
 */
export function usePlansQuery() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load lecture plans');
      }
      return data.plans || [];
    },
  });
}

/**
 * Fetch a specific lecture plan by its ID
 */
export function usePlanQuery(planId) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      if (!planId) return null;
      const res = await fetch(`/api/plans/${planId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load lecture plan');
      }
      return data;
    },
    enabled: Boolean(planId),
  });
}

/**
 * Save or update a lecture plan in the database
 */
export function useSavePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planPayload) => {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planPayload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save lecture plan');
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      if (data?.plan?.id) {
        queryClient.invalidateQueries({ queryKey: ['plan', data.plan.id] });
      }
    },
  });
}

/**
 * Update an existing lecture plan by its ID
 */
export function useUpdatePlanMutation(planId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update lecture plan');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
    },
  });
}

/**
 * Toggle favorite flag on a plan
 */
export function useFavoritePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'favorite' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update favorite status');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Clone / duplicate an existing plan
 */
export function useDuplicatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to duplicate plan');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Delete a specific lecture plan
 */
export function useDeletePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete lecture plan');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Clear all lecture plans for current user
 */
export function useClearAllPlansMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/plans', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to clear all lecture plans');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Fetch all registered users in the platform directory with their connection status
 */
export function useDirectoryUsersQuery(searchTerm = '', department = '') {
  return useQuery({
    queryKey: ['directory-users', searchTerm, department],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('q', searchTerm.trim());
      if (department.trim()) params.append('department', department.trim());

      const res = await fetch(`/api/users/directory?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load faculty directory');
      }
      return data.users || [];
    },
    staleTime: 1000 * 15,
  });
}

/**
 * Fetch authenticated user profile and academic preferences
 */
export function useUserProfileQuery() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load user profile');
      }
      return data.profile;
    },
  });
}

/**
 * Update authenticated user profile and preferences
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileUpdates) => {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileUpdates),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user profile');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

/**
 * Permanently delete authenticated user profile and all associated data
 */
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/users/profile', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
