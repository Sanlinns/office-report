"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DeleteCategoryButton({ name, action }: {
  name: string;
  action: () => Promise<void>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="text-destructive">
          ဖျက်ရန်
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{name} အမျိုးအစားကို အပြီးဖျက်မလား။</AlertDialogTitle>
          <AlertDialogDescription>
            ဒီအမျိုးအစားကို Database ထဲက အပြီးဖျက်ပါမယ်။ ပစ္စည်းနဲ့ ဝယ်စာရင်းဟောင်းတွေကို ဆက်ကြည့်နိုင်ပါတယ်။ ချိတ်ထားတဲ့ပစ္စည်းကို ထပ်ဝယ်စာရင်းသွင်းဖို့ အမျိုးအစား ပြန်သတ်မှတ်ပါ။
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>မဖျက်တော့ပါ</AlertDialogCancel>
          <form action={action}>
            <Button variant="destructive" type="submit">အပြီးဖျက်မည်</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
