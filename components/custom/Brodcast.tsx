import { AlertCircle, Send } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { BroadcastAction } from "@/app/actions/Actions";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useTranslation } from "react-i18next";

export default function BroadcastAccordionItem() {
  const { t } = useTranslation("dashboard");
  const [broadcastMessageText, setBroadcastMessageText] = useState<string>("");
  const [loadding, setLoading] = useState<boolean>(false);

  const handleBroadcastMessage = async () => {
    setLoading(true);
    BroadcastAction(broadcastMessageText).then(result => {
      if (result.ok) {
        toast.success(t("broadcast.broadcastSuccess"), {
          description: result.message,
          duration: 2000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      } else {
        toast.error(t("broadcast.broadcastFailure"), {
          description: result.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      }
    }).catch(error => {
      toast.error(t("broadcast.broadcastFailure"), {
        description: error.message,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    }).finally(() => {
      setLoading(false);
    })
  }

  return (
    <AccordionItem value="sendbroadcast">
      <AccordionTrigger>
        <Send />{t("broadcast.sendBroadcast")}
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex w-full items-center space-x-2">
          <Alert>
            <AlertCircle />
            <AlertTitle>{t("broadcast.encodingIssueTitle")}</AlertTitle>
            <AlertDescription>
              {t("broadcast.encodingIssueDescription")}
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder={t("broadcast.enterBroadcastContent")}
            value={broadcastMessageText}
            readOnly={loadding}
            onChange={(e) => { setBroadcastMessageText(e.target.value) }} />
          <Button disabled={loadding} type="submit" onClick={handleBroadcastMessage}>{t("broadcast.send")}</Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
