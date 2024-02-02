import { Save } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Button } from "../ui/button";
import { SaveAction } from "@/app/actions/Actions";
import { toast } from "sonner"
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function SaveAccordionItem() {
  const { t } = useTranslation("dashboard");
  const [loadding, setLoadding] = useState(false);
  const handleSave = async () => {
    setLoadding(true);
    SaveAction().then(result => {
      if (result.ok) {
        toast.success(t("save.saveSuccess"), {
          description: result.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      } else {
        toast.error(t("save.saveFailure"), {
          description: result.message,
          duration: 5000,
          action: {
            label: "X",
            onClick: () => { },
          },
        });
      }
    }).catch(error => {
      toast.error(t("save.saveFailure"), {
        description: error.message,
        duration: 5000,
        action: {
          label: "X",
          onClick: () => { },
        },
      });
    }).finally(()=>{
      setLoadding(false);
    })
  }

  return (<AccordionItem value="save">
    <AccordionTrigger><Save />{t("save.title")}</AccordionTrigger>
    <AccordionContent >
      <div className="flex w-full items-center space-x-2">
        <Button disabled={loadding} type="submit" onClick={handleSave}>{t("save.submitButtonText")}</Button>
      </div>
    </AccordionContent>
  </AccordionItem>)
}