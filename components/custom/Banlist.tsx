import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Check, ChevronDown, UserX, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ActionResponse, GetBanListAction, GetPlayerSummaries, RemoveBanListAction } from "@/app/actions/Actions";
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,  DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useTranslation } from "react-i18next";

type User = {
  avatar?: string;
  username: string;
  palPlayerID: string;
  steamNickname?: string;
  steamID: string;
  steamURL?: string;
  country?: string;
  vacBanned?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const { t } = useTranslation("dashboard");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {t("banlist.noResults")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableCaption>
        <a>{t("banlist.blacklistCount", { count: data.length })}</a>
      </TableCaption>
    </Table>
  )
}

export default function BanListAccordionItem({refreshKey,setRefreshKey}:{refreshKey:number,setRefreshKey: Dispatch<SetStateAction<number>>}) {
  const { t } = useTranslation("dashboard");
  const [users, setUsers] = useState<User[]>([]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "avatar",
      header: t("banlist.avatar"),
      cell: ({ row }) => {
        return (
          <Avatar>
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>
              {row.original.username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "username",
      header: t("banlist.username"),
    },
    {
      accessorKey: "palPlayerID",
      header: t("banlist.palPlayerID"),
    },
    {
      accessorKey: "steamNickname",
      header: t("banlist.steamNickname"),
      cell: ({ row }) => {
        return (
          <a href={row.original.steamURL} target="_blank" rel="noreferrer">
            {row.original.steamNickname}
          </a>
        );
      },
    },
    {
      accessorKey: "steamID",
      header: t("banlist.steamID"),
      cell: ({ row }) => {
        return (
          <a href={row.original.steamURL} target="_blank" rel="noreferrer">
            {row.original.steamID}
          </a>
        );
      },
    },
    {
      accessorKey: "vacBanned",
      header: t("banlist.vacBanned"),
      cell: ({ row }) => {
        return (
          <div style={{ color: row.original.vacBanned ? "red" : "green" }}>
            {row.original.vacBanned ? <X /> : <Check />}
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: t("banlist.country"),
      cell: ({ row }) => {
        if (!row.original.country) {
          return <span className="text-2xl">🌎</span>;
        }
        const country_flag = getUnicodeFlagIcon(row.original.country);
        return (
          <span className="text-2xl">
            {country_flag ? country_flag : "🌎"}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: t("banlist.actions"),
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={async () => {
                  handleRemoveBanUser(row.original.steamID);
                }}
              >
                {t("banlist.unban")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const processUserData = async (data: ActionResponse) => {
    if (data.ok) {
      const rows = data.message.split("\n");
      const result: User[] = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i] === "") {
          continue;
        }
        const values = rows[i].split(",");
        const tmp_user: User = {
          username: values[0],
          palPlayerID: values[1],
          steamID: values[2]
        }
        result.push(tmp_user);
      }
      setUsers(result);
      const steamIDs = result.map(user => user.steamID);
      if (steamIDs.length > 0) {
        GetPlayerSummaries(steamIDs).then(data => {
          const newUsers = result.map(user => {
            const steamProfile = data.find(profile => profile.steamID === user.steamID);
            if (steamProfile) {
              const tmp_user: User = {
                username: user.username,
                palPlayerID: user.palPlayerID,
                steamID: user.steamID,
                avatar: steamProfile.avatar,
                steamNickname: steamProfile.nickname,
                country: steamProfile.countryCode,
                steamURL: steamProfile.url,
                vacBanned: steamProfile.vacBanned,
              }
              return tmp_user;
            }
            return user;
          })
          setUsers(newUsers);
          toast.success(t("banlist.getBanListSteamSuccess"), {
            description: t("banlist.getBanListSteamSuccess"),
            duration: 2000,
            action: {
              label: "X",
              onClick: () => { },
            },
          });
        }).catch(error => {
          toast.error(t("banlist.getBanListSteamFailure"), {
            description: error.message,
            duration: 5000,
            action: {
              label: "X",
              onClick: () => { },
            }
          });
        });
      }
    }
    return [];
  }

  const handleGetBanUsers = async () => {
    GetBanListAction().then(data => {
      if (data.ok) {
        toast.success(t("banlist.getBanListSuccess"), {
          description: data.message,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
        processUserData(data)
      } else {
        toast.error(t("banlist.getBanListFailure"), {
          description: data.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      }
    }).catch(error => {
      toast.error(t("banlist.getBanListFailure"), {
        description: error.message,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    })
  };

  const handleRemoveBanUser = async (steamID: string) => {
    RemoveBanListAction(steamID).then(data => {
      if (data.ok) {
        setRefreshKey(refreshKey+1);
        toast.success(t("banlist.unbanSuccess"), {
          description: data.message,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
        handleGetBanUsers();
      }else{
        toast.error(t("banlist.unbanFailure"), {
          description: data.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      }
    }).catch(error => {
      toast.error(t("banlist.unbanFailure"), {
        description: error.message,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    })
  };

  useEffect(() => {
    handleGetBanUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <AccordionItem value="user-banlist">
      <AccordionTrigger>
        <UserX />{t("banlist.blacklistManagement")}
      </AccordionTrigger>
      <AccordionContent >
        <div className="flex w-full items-center space-x-2">
          <DataTable columns={columns} data={users} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}