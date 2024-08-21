import prisma from '@/prisma/client';
import { Status } from '@prisma/client';
import IssueActions from './IssueActions';

import Pagination from '@/app/components/Pagination';
import IssueTable, { columnNames, IssueQuery } from './IssueTable';
import { Flex } from '@radix-ui/themes';
import { Metadata } from 'next';

interface Props {
  searchParams: IssueQuery;
}

const IssuesPage = async ({ searchParams }: Props) => {
  const sortingOrders: string[] = ['asc', 'desc'];

  const statuses = Object.values(Status);
  const status = statuses.includes(searchParams.status)
    ? searchParams.status
    : undefined;

  const where = { status };

  const orderBy = columnNames.includes(searchParams.orderBy)
    ? {
        [searchParams.orderBy]:
          searchParams.sortingOrder &&
          sortingOrders.includes(searchParams.sortingOrder)
            ? searchParams.sortingOrder
            : 'desc',
      }
    : undefined;

  const page = parseInt(searchParams.page) || 1;
  const pageSize = 10;

  const issues = await prisma.issue.findMany({
    where,
    orderBy: orderBy || { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const issueCount = await prisma.issue.count({
    where,
  });

  return (
    <Flex direction={'column'} gap={'3'}>
      <IssueActions />
      <IssueTable searchParams={searchParams} issues={issues} />
      <Pagination
        itemCount={issueCount}
        pageSize={pageSize}
        currentPage={page}
      />
    </Flex>
  );
};

export const dynamic = 'force-dynamic';
// export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Issue Tracker - Issue List',
  description: 'View all issues',
};

export default IssuesPage;
