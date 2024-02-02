import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Check, ChevronDown, Users, X } from "lucide-react";
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
import { ActionResponse, AddBanListAction, BanPlayerAction, GetPlayerSummaries, KickPlayerAction, ShowPlayersAction } from "@/app/actions/Actions";
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useTranslation } from 'react-i18next';

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
              {t("users.noResults")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableCaption>
        <a>{t("users.totalPlayers", { count: data.length })}</a>
      </TableCaption>
    </Table>
  )
}



export default function UsersAccordionItem({refreshKey,setRefreshKey}:{refreshKey:number,setRefreshKey: Dispatch<SetStateAction<number>>}) {
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useTranslation("dashboard");

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "avatar",
      header: t("users.avatar"),
      cell: ({ row }) => {
        return <Avatar>
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback>{row.original.username.substring(0, 2)}</AvatarFallback>
        </Avatar>
      }
    },
    {
      accessorKey: "username",
      header: t("users.username"),
    },
    {
      accessorKey: "palPlayerID",
      header: t("users.palPlayerID"),
    },
    {
      accessorKey: "steamNickname",
      header: t("users.steamNickname"),
      cell: ({ row }) => {
        return <a href={row.original.steamURL} target="_blank" rel="noreferrer">{row.original.steamNickname}</a>
      }
    },
    {
      accessorKey: "steamID",
      header: t("users.steamID"),
      cell: ({ row }) => {
        return <a href={row.original.steamURL} target="_blank" rel="noreferrer">{row.original.steamID}</a>
      }
    },
    {
      accessorKey: "vacBanned",
      header: t("users.vacBanned"),
      cell: ({ row }) => {
        return <div style={{ color: row.original.vacBanned ? 'red' : 'green' }}>
          {row.original.vacBanned ? <X /> : <Check />}
        </div>
      }
    },
    {
      accessorKey: "country",
      header: t("users.country"),
      cell: ({ row }) => {

        if (!row.original.country) {
          return <span className="text-2xl">🌎</span>;
        }
        const country_flag = getUnicodeFlagIcon(row.original.country)
        return <span className="text-2xl">{country_flag ? country_flag : "🌎"}</span>
      }
    },
    {
      accessorKey: "actions",
      header: t("users.actions"),
      cell: ({ row }) => {
        return (<DropdownMenu>
          <DropdownMenuTrigger><ChevronDown /></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => { handleKickUser(row.original.steamID) }}>{t("users.kickOut")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { handleBanUser(row.original.steamID, row.original.palPlayerID, row.original.username) }}>{t("users.ban")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>)
      }
    }
  ]

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
          toast.success(t("users.getUserListSteamSuccess"), {
            description: t("users.getUserListSteamSuccess"),
            duration: 2000,
            action: {
              label: "X",
              onClick: () => { },
            },
          });
        }).catch(error => {
          toast.error(t("users.getUserListSteamFailure"), {
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
  const handleGetUsers = async () => {
    // ShowPlayersAction().then(result => {
    //   if (result.ok) {
    //     toast.success(t("users.getUserListSuccess"), {
    //       description: result.message,
    //       duration: 2000,
    //       action: {
    //         label: "X",
    //         onClick: () => { },
    //       },
    //     });
    //     processUserData(result);
    //   } else {
    //     toast.error(t("users.getUserListError"), {
    //       description: result.message,
    //       duration: 5000,
    //       action: {
    //         label: "X",
    //         onClick: () => { },
    //       },
    //     });
    //   }
    // }).catch(error => {
    //   toast.error(t("users.getUserListError"), {
    //     description: error.message,
    //     duration: 5000,
    //     action: {
    //       label: "X",
    //       onClick: () => { },
    //     },
    //   });
    // })

    // Test data
    const data = { message: "name,playeruid,steamid\nuser1,001,76561198146931523\nuser2,002,76561197961123267", ok: true }
    processUserData(data);
  }

  const handleKickUser = async (steamID: string) => {
    KickPlayerAction(steamID).then(result => {
      if (result.ok) {
        setRefreshKey(refreshKey + 1);
        toast.success(t("users.kickPlayerSuccess"), {
          description: result.message,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      } else {
        toast.error(t("users.kickPlayerError"), {
          description: result.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      }
    }).catch(error => {
      toast.error(t("users.kickPlayerError"), {
        description: error.message,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    });
  }

  const handleBanUser = async (steamID: string, palPlayerID: string, username: string) => {
    BanPlayerAction(steamID).then(result1 => {
      AddBanListAction(steamID, palPlayerID, username).then(result2 => {
        if (result1.ok && result2.ok) {
          setRefreshKey(refreshKey + 1);
          toast.success(t("users.banPlayerSuccess"), {
            description: <>{result1.message}<br /><br />{result2.message}</>,
            duration: 15000,
            action: {
              label: "X",
              onClick: () => { },
            },
          });
        } else {
          toast.error(t("users.banPlayerError"), {
            description: <>{result1.message}<br /><br />{result2.message}</>,
            duration: 5000,
            action: {
              label: "X",
              onClick: () => { },
            },
          });
        }
      }).catch(error => {
        toast.error(t("users.banPlayerError"), {
          description: error.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      })
    }).catch(error => {
      toast.error(t("users.banPlayerError"), {
        description: error.message,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    });
  }

  useEffect(() => {
    handleGetUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <AccordionItem value="users">
      <AccordionTrigger>
        <Users /><p>{t("users.onlineUsers")}</p>
      </AccordionTrigger>
      <AccordionContent >
        <div className="flex w-full items-center space-x-2">
          <DataTable columns={columns} data={users} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
