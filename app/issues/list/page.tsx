import prisma from '@/prisma/client';
import { Table } from '@radix-ui/themes';
import { Link, IssueStatusBadge } from '@/app/components';
import IssueActions from './IssueActions';
import { Issue, Status } from '@prisma/client';
import NextLink from 'next/link';
import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import Pagination from '@/app/components/Pagination';

interface Props {
  searchParams: {
    status: Status;
    orderBy: keyof Issue;
    sortingOrder?: 'asc' | 'desc';
    page: string;
  };
}

const IssuesPage = async ({ searchParams }: Props) => {
  const columns: {
    label: string;
    value: keyof Issue;
    className?: string;
  }[] = [
    { label: 'Issue', value: 'title' },
    { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
    { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' },
  ];

  const sortingOrders: string[] = ['asc', 'desc'];

  const statuses = Object.values(Status);
  const status = statuses.includes(searchParams.status)
    ? searchParams.status
    : undefined;

  const where = { status };

  const orderBy = columns
    .map((column) => column.value)
    .includes(searchParams.orderBy)
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
    <div>
      <IssueActions />
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeaderCell
                key={column.label}
                className={column.className}
              >
                <NextLink
                  href={{
                    query: {
                      ...searchParams,
                      orderBy: column.value,
                      sortingOrder:
                        searchParams.orderBy === column.value &&
                        searchParams.sortingOrder === 'asc'
                          ? 'desc'
                          : 'asc',
                    },
                  }}
                >
                  {column.label}
                </NextLink>
                {column.value === searchParams.orderBy &&
                  (searchParams.sortingOrder === 'asc' ? (
                    <ArrowUpIcon className="inline" />
                  ) : (
                    <ArrowDownIcon className="inline" />
                  ))}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {issues.map((issue) => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                <div className="block md:hidden">
                  <IssueStatusBadge status={issue.status} />
                </div>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <IssueStatusBadge status={issue.status} />
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {issue.createdAt.toDateString()}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Pagination
        itemCount={issueCount}
        pageSize={pageSize}
        currentPage={page}
      />
    </div>
  );
};

export const dynamic = 'force-dynamic';
// export const revalidate = 60;

export default IssuesPage;
