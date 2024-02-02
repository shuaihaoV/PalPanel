import { CircleOff, AlertCircle } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { DoExitAction } from "@/app/actions/Actions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function DoExitAccordionItem() {
  const { t } = useTranslation("dashboard");
  const [doExitConfirmText, setDoExitConfirmText] = useState<string>("");
  const [loadding, setLoadding] = useState<boolean>(false);
  const handleDoExit = async () => {
    if (doExitConfirmText !== "exit") {
      toast.warning(t("doexit.confirmationTextError"), {
        description: t("doexit.confirmationTextErrorDescription"),
        duration: 5000,
        action: {
          label: "X",
          onClick: () => {},
        },
      });
      return;
    }
    setLoadding(true);
    DoExitAction().then(result =>{
      if (result.ok) {
        toast.success(t("doexit.closeServerSuccess"), {
          description: result.message,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => {},
          },
        });
      } else {
        toast.error(t("doexit.closeServerFailure"), {
          description: result.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => {},
          },
        });
      }
    }).catch(error => {
      toast.error(t("doexit.closeServerFailure"), {
        description: error.message,
        duration: 5000,
        action:{
          label: "X",
          onClick: () => {
          }
        }
      })
    }).finally(()=>{
      setLoadding(false);
    });
  };

  return (
    <AccordionItem value="doexit">
      <AccordionTrigger>
        <CircleOff />
        {t("doexit.forceCloseServer")}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex w-full items-center space-x-2">
          <Alert>
            <AlertCircle style={{ color: "red" }} />
            <AlertTitle>{t("doexit.warning")}</AlertTitle>
            <AlertDescription>
              {t("doexit.forceCloseServerWarning")}
              <br />
              {t("doexit.recommendation")}
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex w-full items-center space-x-2 mt-2">
          <Input
            type="text"
            placeholder={t("doexit.confirmationTextPlaceholder")}
            value={doExitConfirmText}
            onChange={(e) => {
              setDoExitConfirmText(e.target.value);
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={loadding} variant="outline">{t("doexit.forceCloseServer")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("doexit.confirmForceCloseServer")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("doexit.forceCloseServerDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("doexit.cancel")}</AlertDialogCancel>
                <AlertDialogAction disabled={loadding} onClick={handleDoExit}>
                  {t("doexit.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
