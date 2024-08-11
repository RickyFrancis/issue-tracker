'use client';

import { User } from '@prisma/client';
import { Select } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/app/components';

const AssigneeSelect = () => {
  const {
    data: users,
    error,
    isLoading,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  if (isLoading) return <Skeleton height={35} />;

  if (error) return null;

  return (
    <Select.Root>
      <Select.Trigger placeholder="Assign..." />
      <Select.Content>
        <Select.Group>
          <Select.Label>Suggestions</Select.Label>
          {users?.map((user) => (
            <Select.Item key={user.id} value={user.id}>
              {user.name}
            </Select.Item>
          ))}
        </Select.Group>
        <Select.Separator />
      </Select.Content>
    </Select.Root>
  );
};

export default AssigneeSelect;
