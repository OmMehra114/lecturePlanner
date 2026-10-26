'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Fetch all connections and pending requests for the authenticated user
 */
export function useConnectionsQuery() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const res = await fetch('/api/connections');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch connections');
      }
      return data;
    },
  });
}

/**
 * Search users by query string (debounced/minimum 2 characters)
 */
export function useSearchUsersQuery(searchTerm) {
  return useQuery({
    queryKey: ['users-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search users');
      }
      return data.users || [];
    },
    enabled: Boolean(searchTerm && searchTerm.trim().length >= 2),
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * Send a connection request mutation
 */
export function useSendConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetIdentifier, message }) => {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetIdentifier, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send connection request');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['users-search'] });
    },
  });
}

/**
 * Respond to a connection request (Accept or Decline) mutation
 */
export function useRespondConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId, status }) => {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to respond to connection request');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

/**
 * Remove or disconnect an existing connection mutation
 */
export function useRemoveConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId) => {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove connection');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

/**
 * Share a lecture plan with a connected peer mutation
 */
export function useSharePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, receiverId, permission, message }) => {
      const res = await fetch('/api/plans/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, receiverId, permission, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to share plan');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-plans'] });
    },
  });
}

/**
 * Fetch plans shared with the user
 */
export function useReceivedPlansQuery() {
  return useQuery({
    queryKey: ['shared-plans'],
    queryFn: async () => {
      const res = await fetch('/api/plans/share');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch shared plans');
      }
      return data.shares || [];
    },
  });
}
