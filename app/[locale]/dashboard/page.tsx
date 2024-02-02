"use client";
import { useEffect, useState } from 'react';
import { InfoAction, logout } from '../../actions/Actions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import SaveAccordionItem from '@/components/custom/Save';
import ShutdownAccordionItem from '@/components/custom/Shutdown';
import DoExitAccordionItem from '@/components/custom/DoExit';
import BroadcastAccordionItem from '@/components/custom/Brodcast';
import BanlistAccordionItem from '@/components/custom/Banlist';
import UsersAccordionItem from '@/components/custom/Users';
import { LogOut, RotateCw } from 'lucide-react';
import { toast } from "sonner"
import { useTranslation } from 'react-i18next';
import LanguageChanger from '@/locales/LanguageChanger';

export default function Home() {
  const { t } = useTranslation("dashboard");
  const [serverInfo, setServerInfo] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const handleServerInfo = async () => {
    InfoAction().then(res => {
      if (res.ok) {
        toast.success(t("serverInfoToastSuccess"), {
          description: res.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
        setServerInfo(res.message)
      } else {
        toast.error(t("serverInfoToastFailure"), {
          description: res.message,
          duration: 10000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      }
    }).catch(err => {
      toast.error(t("serverInfoToastFailure"), {
        description: err,
        duration: 10000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    })
  }
  useEffect(() => {
    handleServerInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full h-full max-w-3xl p-4">
        <CardTitle className="flex">
          <div className="leading-10">
            {serverInfo === undefined ? <Skeleton className="h-6 w-full" /> : <p>{serverInfo}</p>}
          </div>
          <div className='ml-auto flex space-x-2'>
            <LanguageChanger />
            <Button
              variant="outline" size="icon"
              onClick={async () => {
                setRefreshKey(refreshKey + 1);
              }}><RotateCw /></Button>
            <Button
              variant="outline" size="icon"
              onClick={async () => {
                logout();
                toast.info(t("logoutToastMessage"), {
                  description: t("logoutToastDescription"),
                  action: {
                    label: "X",
                    onClick: () => { },
                  },
                })
              }}><LogOut /></Button>
          </div>
        </CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
        <CardContent className='p-2 mt-2'>
          {serverInfo === undefined ? <Skeleton className="h-10 w-full" /> :
            <Accordion type="single" collapsible className="w-full h-full" defaultValue='users'>
              <UsersAccordionItem key={"Users_"+refreshKey} setRefreshKey={setRefreshKey} refreshKey={refreshKey}/>
              <BanlistAccordionItem key={"Banlist_"+refreshKey} setRefreshKey={setRefreshKey} refreshKey={refreshKey}/>
              <BroadcastAccordionItem />
              <SaveAccordionItem />
              <ShutdownAccordionItem />
              <DoExitAccordionItem />
            </Accordion>}
        </CardContent>
        <CardFooter className='flex justify-center mt-2'>
          2024 @ShuaiHao
          <a
            href="https://github.com/shuaihaoV/PalPanel"
            className="pl-2 font-medium text-primary underline underline-offset-4 top-2"
            target="_blank"
            rel="noreferrer"
          >Github</a>
      </CardFooter>
      </Card>
    </main>
  )
}