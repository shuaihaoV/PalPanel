import { Label } from "@radix-ui/react-label";
import { MonitorX, AlertCircle } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { useState } from "react";
import { ShutdownAction } from "@/app/actions/Actions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function ShutdownAccordionItem() {
  const { t } = useTranslation("dashboard");
  const [shutdownSeconds, setShutdownSeconds] = useState<number>(60);
  const [shutdownBroadcastMessageText, setShutdownBroadcastMessageText] = useState<string>("");
  const [loadding, setLoadding] = useState<boolean>(false);
  const handleShutdown = async () => {
    setLoadding(true);
    ShutdownAction(shutdownSeconds, shutdownBroadcastMessageText).then(result => {
      if (result.ok) {
        toast.success(t("shutdown.shutdownSuccessTitle"), {
          description: result.message,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => { },
          }
        })
      } else {
        toast.error(t("shutdown.shutdownFailureTitle"), {
          description: result.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          }
        })
      }
    }).catch(error => {
      toast.error(t("shutdown.shutdownFailureTitle"), {
        description: error,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        }
      });
    }).finally(()=>{
      setLoadding(false);
    });
  };

  return (
    <AccordionItem value="shutdown">
      <AccordionTrigger>
        <MonitorX />
        {t("shutdown.shutdownServerTitle")}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex w-full items-center space-x-2">
          <Alert>
            <AlertCircle style={{ color: "red" }} />
            <AlertTitle>{t("shutdown.warningTitle")}</AlertTitle>
            <AlertDescription>{t("shutdown.warningDescription")}</AlertDescription>
          </Alert>
        </div>
        <div className="flex w-full items-center space-x-2 mt-4">
          <Label>
            {shutdownSeconds}
            {t("shutdown.secondsLabel")}
          </Label>
          <Slider
            defaultValue={[shutdownSeconds]}
            max={300}
            min={5}
            step={1}
            onValueChange={(value: number[]) => {
              setShutdownSeconds(value[0]);
            }}
          />
        </div>
        <div className="flex w-full items-center space-x-2 mt-4">
          <Input
            type="text"
            placeholder={t("shutdown.broadcastPlaceholder")}
            value={shutdownBroadcastMessageText}
            readOnly={loadding}
            onChange={(e) => {
              setShutdownBroadcastMessageText(e.target.value);
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={loadding} variant="outline">{t("shutdown.shutdownButton")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("shutdown.confirmShutdownTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("shutdown.shutdownConfirmationDescription", { seconds: shutdownSeconds })}
                  <br />
                  {t("shutdown.saveBeforeAction")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("shutdown.cancelButton")}</AlertDialogCancel>
                <AlertDialogAction disabled={loadding} onClick={handleShutdown}>{t("shutdown.confirmButton")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
